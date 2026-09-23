import ccxt, { type Exchange as CcxtExchange } from 'ccxt';
import { decryptSecret } from './security/credentials.js';

export type SupportedExchange = 'binance' | 'coinbase' | 'kraken';

const constructors: Record<SupportedExchange, new (config: Record<string, string>) => CcxtExchange> = {
  binance: ccxt.binance,
  coinbase: ccxt.coinbase,
  kraken: ccxt.kraken
};

export function createReadOnlyExchange(input: {
  exchange: SupportedExchange;
  apiKeyCipher: string;
  secretCipher: string;
  passphraseCipher?: string | null;
}): CcxtExchange {
  const credentials: Record<string, string> = {
    apiKey: decryptSecret(input.apiKeyCipher),
    secret: decryptSecret(input.secretCipher),
    enableRateLimit: 'true'
  };
  if (input.passphraseCipher) credentials.password = decryptSecret(input.passphraseCipher);
  const client = new constructors[input.exchange](credentials);
  client.options = { ...(client.options ?? {}), defaultType: 'spot' };
  return client;
}

export async function verifyBalances(client: CcxtExchange) {
  const balance = await client.fetchBalance();
  const free = balance.free as unknown as Record<string, number | undefined>;
  const used = balance.used as unknown as Record<string, number | undefined>;
  return Object.entries(balance.total ?? {})
    .filter(([, total]) => typeof total === 'number' && total > 0)
    .map(([asset, total]) => ({
      asset,
      free: free[asset] ?? 0,
      used: used[asset] ?? 0,
      total
    }));
}