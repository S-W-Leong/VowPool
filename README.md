# VowPool

An accountability circle with commitment escrow on Solana Devnet. Members agree to frozen terms, choose peer or configured GitHub verification, and lock test tokens. Financial outcomes come from the program’s confirmed state.

This branch applies the approved minimal Pact Club design: ivory, forest green, editorial type and a ripple mark. One navigation row leads to Commitments, Reviews and Pool. Full terms and reviewer records live in the focused detail view.

## Run the web app

Requires Bun 1.3.11 and the existing dependencies in `bun.lock`.

```sh
bun install --frozen-lockfile
bun run dev
```

Create `apps/web/.env.local` using `.env.example` as a reference. Set `NEXT_PUBLIC_VOWPOOL_GROUP` to the actual bootstrapped Devnet group address. The default RPC is Solana Devnet. Keep API credentials server-only. Without a group address, the app shows the setup state and unavailable balances; it does not substitute fixture data.

```sh
bun run test
bun run typecheck
bun run build
```

For the isolated design preview: `bun --cwd apps/web start --port 3012` after building.

## Design and verification

See [the product spec](docs/2026-10-07-accountability-mvp-design.md), [design QA](design-qa.md), and [implementation notes](docs/pact-club-design.md). Screenshots of populated lists use explicitly labeled development fixtures. The temporary fixture route is removed from the production app.

This UI work does not establish a deployed CRE workflow or new Devnet transaction evidence. Actual wallet transactions still require configured accounts and member wallets. No financial rules, program Rust, receiver authentication or custody logic were changed. The app retains the existing transaction phase/receipt flow and re-fetches confirmed accounts after transactions.
