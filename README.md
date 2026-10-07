# VowPool

Commitment escrow for a fixed accountability group on Solana Devnet. Members freeze their goal, stake, verifier policy and deadlines before funding. Approval returns the stake. Missing peer approval moves it to the communal budget.

**Test tokens only.** The program is deployed with upgrade authority retained. The app and tests implement four modes. CRE native simulation and real Devnet writes through the official mock forwarder work. Live DON deployment is unavailable for the current CRE account. The actual user group, member-wallet rehearsal, AI provider call and submission recording remain pending.

## Run locally

Pinned versions: Bun 1.3.11, Node 24.11.1, Anchor 0.32.1, Agave 2.3.0, CRE CLI 1.37.0, CRE TypeScript SDK 1.23.0. Node 24 supplies `node:sqlite`. Use the existing Bun lockfile.

```sh
bun install --frozen-lockfile
cp .env.example apps/web/.env.local
bun run dev
```

Configure `OPENAI_API_KEY` only in the server environment. The manual form works without it. Set `NEXT_PUBLIC_VOWPOOL_GROUP` after bootstrap, or export the prepared configuration to `deployments/devnet.json` and rebuild. `NEXT_PUBLIC_SOLANA_RPC_URL` must point to Devnet. The transaction manager checks the genesis hash before and after signing.

```sh
bun run typecheck
bun run test
bun run build
node apps/web/node_modules/next/dist/bin/next start apps/web
```

The production app defaults to port 3000. A public preview must keep this process and local SQLite storage running. A temporary tunnel is suitable for rehearsal, with no persistence or availability guarantee. Serverless deployment needs a durable SQLite-compatible adapter or external supporting metadata store before relying on evidence persistence. Financial outcomes always come from Solana.

## Program checks

```sh
export PATH="$PWD/.tools/bin:$PWD/.tools/solana-release/bin:$PATH"
anchor build
cargo build-sbf --manifest-path programs/mock-forwarder/Cargo.toml
solana-test-validator --reset --ledger .tools/test-ledger \
  --bpf-program A2JT4HUJYEd3BL5xPXRiaXjvoFSMetY8zvLEPmRAxXPf target/deploy/vowpool.so \
  --bpf-program Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgMQHGhGusJA target/deploy/mock_forwarder.so
# In another terminal:
anchor test --skip-build --skip-deploy --skip-local-validator
cargo test -p vowpool
VOWPOOL_RPC_SMOKE=1 bun run test:web
```

The local mock is an unrestricted test double. Never deploy it to Devnet. Exact deadline tests use the compiled SBF program in LiteSVM; the extra local-validator test exercises actual RPC funding, approval and refund.

## Public deployment and evidence

- Program: [A2JT4…AxXPf](https://explorer.solana.com/address/A2JT4HUJYEd3BL5xPXRiaXjvoFSMetY8zvLEPmRAxXPf?cluster=devnet). IDL: `idl/vowpool.json`.
- Program receipt and retained authority: `deployments/devnet.json`.
- Separate **development fixture**: `deployments/staging-fixture.json` and `deployments/staging-fixture-verification.json` contain real receipts and confirmed account/balance assertions. Fresh fixture wallets and the official mock forwarder do not establish live DON origin.
- Native CRE broadcast refunded 1.25 test tokens after recorded peer approval, expired an unapproved 1-token peer goal into the pool, and recorded a non-qualifying GitHub merge as failure. Final fixture pool/vault: 2 test tokens. Owner: 98 of the initial 100. One abandoned, unfunded draft remains visible.

```sh
bun scripts/smoke-devnet.ts deployments/staging-fixture.json
bun scripts/export-deployment.ts deployments/devnet.json .tools/keys/devnet-deployer.json
```

The exporter checks Devnet, the deployed executable, actual loader metadata and upgrade authority. An initialized group additionally requires matching mint, vault and token authority. It writes only public configuration and an IDL copy; its CLI signer file is never copied into the output.

Current rehearsal preview: [temporary VowPool fixture](https://buyer-strand-hours-ross.trycloudflare.com). It depends on this machine and its SQLite disk staying available. Draft presentation files and their verification notes are in `deliverables/`; recording and final upload are pending.

## Prepare the actual fixed group

Provide 2–8 distinct **public member addresses**, the member founder, treasurer and fixed treasury recipient. Deployer and member roles must be distinct. Bootstrap creates one ordinary SPL mint with six decimals, gives each member 100 test tokens and 0.03 Devnet SOL for rent/fees, and prepares public configuration. The founder initializes the group with their browser wallet. The server never holds a member key.

```sh
bun scripts/bootstrap-devnet.ts PUBLIC_GROUP_CONFIG.json .tools/keys/devnet-deployer.json
bun run build
```

The config schema is `packages/shared/src/group-setup.ts`. Use the verified official live forwarder/state for the actual group. Missing workflow identity can remain all-zero for a **peer-only group**; automated creation stays disabled. A frozen policy cannot be changed later. Enabling D requires a new group with an actual deployed workflow CID/name/owner and exercised receiver authentication. Simulator metadata cannot serve as that identity.

Bootstrap rejects mock/unrecognized forwarders unless `developmentFixture: true`, validates the Devnet genesis and forwarder state ownership, and rejects a second mint bootstrap once its public output records a mint. Keep public receipt files and recover a partially prepared setup instead of minting again.

## CRE verification

```sh
CRE_SOLANA_PRIVATE_KEY="$PWD/.tools/keys/cre-transmitter.json" \
  .tools/bin/cre workflow simulate workflows/accountability --project-root cre \
  --target local-simulation --non-interactive --trigger-index 0
```

The local target performs a real public GitHub HTTP fetch and deterministic evaluation against sample timing. It constructs no report and sends no transaction. Staging reads real group/commitment accounts and exercises the official Devnet mock forwarder:

The separate `rpc-check` target uses known public fixture addresses, with no candidate API dependency. It checks genesis, then batches Clock, forwarder state, group and commitments through confirmed `getMultipleAccounts`. It creates no report or transaction, even with `--broadcast`. Its real read evidence and independent chain-reader comparison are in `deployments/rpc-check.json`.

```sh
CRE_SOLANA_PRIVATE_KEY="$PWD/.tools/keys/cre-transmitter.json" \
  .tools/bin/cre workflow simulate workflows/accountability --project-root cre \
  --target rpc-check --non-interactive --trigger-index 0
```

```sh
# Set config.staging.json candidatesUrl to your running HTTPS /api/candidates endpoint.
# Dry run first, then broadcast only to the explicitly labeled fixture.
CRE_SOLANA_PRIVATE_KEY="$PWD/.tools/keys/cre-transmitter.json" \
  .tools/bin/cre workflow simulate workflows/accountability --project-root cre \
  --target staging-settings --non-interactive --trigger-index 0
CRE_SOLANA_PRIVATE_KEY="$PWD/.tools/keys/cre-transmitter.json" \
  .tools/bin/cre workflow simulate workflows/accountability --project-root cre \
  --target staging-settings --non-interactive --trigger-index 0 --broadcast
```

Candidate hints never authorize an outcome. CRE rechecks program ownership, group/commitment PDAs, canonical configuration hashes and frozen policy. It fetches only the exact public PR endpoint, validates bounded response fields and evaluates identical consensus observations. Reports bind the account list and actual workflow metadata. The receiver independently checks the forwarder state/PDA and CID/name/owner. Workflow deadline decisions use the validated Solana Clock timestamp, bounded by runtime time, so a runtime clock ahead of Devnet cannot produce a future observation.

The reader validates bounded account bytes/vector/string lengths before codec decoding and preserves integer fields as bigint. Identical consensus applies to validated account semantics; context slots use median aggregation for diagnostics, and unrelated lamports, rent, padding and group accounting are excluded. An invalid candidate is skipped while valid items continue. A cross-node semantic disagreement defers the whole bounded five-item batch; no outcome is authorized. Discovery currently examines at most 25 hints per cycle. RPC failures never classify a commitment as failed, and the handler does not retry in a tight loop. Actual multi-node DON behavior remains unexercised because tenant deployment is unavailable. `candidateAddresses` supports known-address hints when `candidatesUrl` is omitted or unavailable.

Current tenant access reports deployment disabled. `config.production.json` intentionally remains incomplete. No live workflow, DON execution ID or qualifying post-activation merge/refund has been demonstrated. The public GitHub fixture captures PR1652, merged before our commitment activation, for an honest non-qualifying case. See `docs/integration-check.md` and `docs/demo.md`.

## Financial and data boundaries

A: one appointed reviewer. B: all appointed reviewers. Each appointed reviewer acknowledges before activation. C: any eligible non-owner group member. D: only public GitHub PR policy v1, with no peer acknowledgment or approval.

Goal text, evidence and progress stay offchain. Canonical Borsh hashes bind terms/configuration; immutable onchain fields independently bind financial data. Export original terms before relying on storage. Evidence requires the owner’s wallet signature over a commitment-bound, one-use challenge. SQLite uses WAL on the host filesystem and has no outcome authority.

A/B/C require recorded approval by the review cutoff. D accepts only the exact PR/branch with `activated_at < merged_at <= goal_deadline`. API errors are UNKNOWN. Inconclusive verification more than 48 hours after review becomes a distinct unresolved refund. Outcome and payout are separate; failed token delivery leaves a retryable entitlement. Permissionless peer expiry, recorded refund and D unresolved resolution work from the detail page. Pool withdrawal uses only recorded forfeitures and the fixed treasury recipient, protecting active escrow and unpaid refunds. Donations do not create spendable pool credit.

AI drafts schema-validated configuration for explicit user review. It cannot generate executable workflows, approve completion or move funds. Repository/PR identifiers absent from the user’s input are cleared and requested. Rate/size bounds protect the server routes. Mainnet and real funds are outside this demo.
