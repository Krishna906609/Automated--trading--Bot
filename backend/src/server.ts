import 'dotenv/config';
import crypto from 'node:crypto';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import { z } from 'zod';
import { encryptSecret } from './security/credentials.js';
import { verifyBalances, type SupportedExchange } from './exchanges.js';

const app = Fastify({ logger: true, requestIdHeader: 'x-request-id', genReqId: () => crypto.randomUUID() });
const credentialSchema = z.object({
  exchange: z.enum(['binance', 'coinbase', 'kraken']),
  label: z.string().min(1).max(64),
  apiKey: z.string().min(8).max(256),
  secret: z.string().min(8).max(512),
  passphrase: z.string().max(512).optional()
});

await app.register(helmet, { contentSecurityPolicy: false });
await app.register(sensible);
await app.register(rateLimit, { max: Number(process.env.REQUEST_RATE_LIMIT ?? 60), timeWindow: '1 minute' });

app.get('/health', async () => ({ status: 'ok', service: 'asteria-backend', liveOrdersEnabled: false }));

app.post('/v1/credentials', async (request, reply) => {
  const parsed = credentialSchema.safeParse(request.body);
  if (!parsed.success) return reply.badRequest('Invalid credential payload');
  const { apiKey, secret, passphrase, exchange, label } = parsed.data;
  request.log.info({ exchange, label }, 'Credential accepted for encrypted persistence');
  return reply.code(201).send({
    status: 'accepted',
    exchange,
    label,
    encrypted: {
      apiKey: encryptSecret(apiKey),
      secret: encryptSecret(secret),
      ...(passphrase ? { passphrase: encryptSecret(passphrase) } : {})
    },
    note: 'Persist encrypted values with Prisma after authenticating the user.'
  });
});

app.post('/v1/balances/verify', async (request, reply) => {
  const body = z.object({ exchange: z.enum(['binance', 'coinbase', 'kraken']) }).safeParse(request.body);
  if (!body.success) return reply.badRequest('exchange is required');
  return reply.code(501).send({
    error: 'credential_repository_required',
    exchange: body.data.exchange,
    message: 'Load the authenticated user credential from Prisma, decrypt only in memory, call verifyBalances(), persist a BalanceSnapshot, then discard secrets.'
  });
});

app.post('/v1/orders', async (_request, reply) => reply.code(403).send({
  error: 'live_orders_disabled',
  message: 'Order placement is intentionally disabled until supervised risk controls and an approval workflow exist.'
}));

const port = Number(process.env.PORT ?? 8080);
await app.listen({ port, host: '0.0.0.0' });