# Asteria AI Trading Workspace

Asteria is a polished browser prototype for an AI-assisted arbitrage workspace. It includes:

- Instant demo login and standard login entry point
- Responsive futuristic command center with animated signal styling
- Triangular and cross-exchange modules available from the main workspace
- Paper-market scan interactions, opportunity watchlist, and simulated P&L
- Autonomous paper engine that scores triangular and cross-exchange routes with bounded TP/SL output
- Subscription modal with Starter, Operator, and VIP plan presentation
- Mobile-friendly download entry point for a future signed application release

## Run locally

This prototype has no build step or external runtime dependency:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173` and choose **Explore instant demo**.

## Security boundary

The current project is intentionally a front-end prototype. It does not accept, store, or ship exchange keys, Google AI keys, payment secrets, or real-money execution logic. The supplied keys should be considered exposed and rotated; they are not included in this repository.

For a production build, add a server-side service that:

1. Stores exchange credentials in a secret manager with per-user encryption and withdrawal permissions disabled.
2. Provides separate server-side adapters for triangular and cross-exchange analysis, each with its own model configuration and rate limits.
3. Imports market metadata from `cryptodatapy` through a reviewed, pinned ingestion job rather than running untrusted repository code inside the UI.
4. Verifies an active subscription through a payment provider webhook before enabling any live execution endpoint.
5. Keeps paper mode as the default and requires explicit risk acknowledgement, max-notional limits, stale-quote checks, and a kill switch before any live order route exists.

The subscription cards and download button in this prototype are presentation flows only. A signed APK and crypto checkout require provider credentials and a mobile/backend release pipeline.

## Backend scaffold

The `backend/` directory contains the secure service boundary for a future production deployment:

- Fastify API with Helmet, request IDs, and rate limiting
- PostgreSQL schema for encrypted exchange credentials, balance snapshots, and immutable audit events
- AES-256-GCM credential encryption using `APP_ENCRYPTION_KEY`
- CCXT read-only adapters for Binance, Coinbase, and Kraken balance verification
- Explicitly blocked `/v1/orders` endpoint until supervised risk and approval controls exist
- Docker Compose for local API/PostgreSQL development
- GitHub Actions typecheck, build, Prisma generation, and dependency audit workflow

Run the backend locally:

```bash
cd backend
cp .env.example .env
# Generate a 32-byte key with: openssl rand -hex 32
npm install
npx prisma generate
npm run dev
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the deployment topology and production checklist. Do not use the placeholder database password or commit `.env` files.

## Autonomous engine behavior

The dashboard's **Start paper engine** control runs a local simulation loop. Every cycle it selects a candidate route, estimates a spread and volatility band, derives bounded take-profit and stop-loss levels, and records the decision as a simulated paper position. It never submits an order, calls an exchange, or sends data to Google AI Studio.

To connect a production model safely, implement a server-side adapter with an allowlisted model ID, request timeout, schema validation, cost limits, and fallback behavior. Treat model output as a proposal: deterministic risk checks must approve a trade before a separate execution service can act. Keep live execution disabled until credential custody, subscription webhooks, audit logging, kill switches, and explicit user risk acknowledgement are implemented.