# VowPool

Commitment escrow for accountability groups on Solana Devnet. Any connected founder can create a group with a fixed roster. Members freeze their goal, stake, verifier policy and deadlines before funding. Final approval automatically returns the stake through the demo refund service. Missing peer approval moves it to the communal budget.

**Test tokens only.** The program is deployed with upgrade authority retained. The app and tests implement four modes. CRE native simulation and real Devnet writes through the official mock forwarder work. Local CRE simulation is accepted for this demo; no workflow deployment is required. The browser-demo roster and custom mint are prepared and both member wallets are funded, with independent checks in `deployments/demo-bootstrap-verification.json`. Founder initialization, member-wallet rehearsal, AI provider call and submission recording remain pending. Live DON authentication is unverified.

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

## Create your group in the app

1. Connect a browser wallet on Devnet and choose **Create your group**.
2. Enter 1–7 invited public wallet addresses. Your founder wallet is included automatically. Choose a treasurer and review the frozen roster and treasury destination.
3. If your wallet needs demo funding, sign the funding message, then sign the onchain group creation transaction. No group wallet or keypair needs to be created manually.
4. Copy the invitation link. Invited members open it and connect their own matching wallet; this app does not send messages on their behalf.
5. Create a commitment, complete any reviewer acknowledgments and lock the stake. After final approval, the server returns it automatically. Check the refund receipt and confirmed balance.

Judges can use their own wallets and groups. The existing program allows one group per founder wallet; rosters cannot be edited after creation. Groups share the custom test mint but have separate vaults and accounting. **Get demo tokens** requires a wallet signature and provides a one-time top-up to 100 test tokens and 0.03 Devnet SOL, capped at 20 distinct wallet/mint grants per demo database. It is not an unlimited faucet. If a grant's confirmation is uncertain, inspect its stored receipt before retrying.

To enable judge funding and automatic payouts, start the server from the repository root with its existing Devnet utility payer:

```sh
VOWPOOL_DEMO_PAYER_KEY_PATH="$PWD/.tools/keys/devnet-deployer.json" \
  node apps/web/node_modules/next/dist/bin/next start apps/web
```

This path is server-only. The service signs test-token grants and permissionless refund delivery; members still sign group creation, commitments, acknowledgments, approvals and treasury withdrawals themselves. The server must stay running and its utility payer needs Devnet SOL. A 30-second background sweep retries recorded refunds even when the owner is offline. Outcome recording and payout remain separate transactions, so delivery failure preserves the entitlement. The detail page offers a manual refund retry.

The real Devnet rehearsal created a separate two-wallet group, staked one token, recorded reviewer approval and observed the background service return it in 14 seconds without an owner payout action. Eight transaction receipts were independently confirmed, with owner balance restored and vault/liabilities zero. This uses disposable development wallets, not the supplied browser wallets. To run a fresh rehearsal against the running funded server:

```sh
bun scripts/rehearse-self-service.ts
```

Each fresh run consumes two demo grants and Devnet SOL. Public evidence is saved to `deployments/self-service-verification.json`; disposable private keys stay in memory. The supplied founder initialization, browser-wallet rehearsal and qualifying GitHub merge remain pending.

## Prepare the shared test mint and initial group

Provide 2–8 distinct **public member addresses**, the member founder, treasurer and fixed treasury recipient. Deployer and member roles must be distinct. Bootstrap creates one ordinary SPL mint with six decimals, gives each member 100 test tokens and 0.03 Devnet SOL for rent/fees, and prepares public configuration. The founder initializes the group with their browser wallet. The server never holds a member key.

```sh
bun scripts/bootstrap-devnet.ts PUBLIC_GROUP_CONFIG.json .tools/keys/devnet-deployer.json
bun run build
```

The config schema is `packages/shared/src/group-setup.ts`. The current browser demo explicitly uses `developmentFixture: true`, the official mock forwarder and simulator metadata; this supports local CRE broadcast to Devnet without claiming live DON authentication. Its native policy preflight matched before bootstrap. Use `config.demo.json` with the existing `staging-settings` workflow target and update candidate addresses after commitments are created. A live group instead requires the verified live forwarder/state and actual deployed workflow CID/name/owner. Missing workflow identity can remain all-zero for a **peer-only group**; automated creation stays disabled. A frozen policy cannot be changed later. Simulator metadata cannot serve as a live identity.

Bootstrap rejects mock/unrecognized forwarders unless `developmentFixture: true`, validates the Devnet genesis and forwarder state ownership, and rejects a second mint bootstrap once its public output records a mint. Keep public receipt files and recover a partially prepared setup instead of minting again.

## Solana accounts, in plain language

If you are new to Solana, think of VowPool as using different account types for people, token balances and app records. These are related, but they are not interchangeable:

### People and signatures

| Item | Plain-language meaning | VowPool use |
|---|---|---|
| Member wallet | A public Solana address paired with a private signing key held by the member's wallet app, such as Phantom | Identifies a member and signs that member's transactions. Share the public address for the roster; never share the recovery phrase or private key. |
| Wallet signature | A cryptographic approval made by the wallet | Proves that the member approved a transaction. The VowPool server does not sign member actions. |

Connecting Phantom lets a founder create their own group. Joining an existing group requires the member's public address to be in its roster, frozen by the founder at creation.

### Token definition and token balances

| Item | Plain-language meaning | VowPool use |
|---|---|---|
| Token program | Shared Solana software that validates token accounts and performs token transfers | Processes the test-token transfers. It is not a VowPool group account. |
| Mint account | The onchain definition of one token type, including its decimal precision | Defines the group's shared Devnet test token. The tokens have no real-money value. |
| Member token account (ATA) | A token balance account associated with a particular wallet and mint; think of it as that wallet's pocket for this token | Holds the member's test-token balance. A member can have a different token account for each mint. |
| Group vault | A token account controlled by the VowPool program | Holds staked test tokens. The program transfers them only under the recorded rules. |

The member wallet signs transfers; it does not itself store SPL token balances. A member's ATA and the group vault are both token accounts, but their owners and purposes differ.

### VowPool's onchain records

| Item | Plain-language meaning | VowPool use |
|---|---|---|
| Group account | VowPool's onchain settings and accounting record for the fixed group | Stores the roster, mint and vault addresses, treasurer, fixed treasury recipient, CRE policy and accounting totals. It does not itself hold tokens. |
| Commitment account | One promise's onchain record | Stores the owner, stake amount, mode, reviewers, deadlines, status and hashes that bind the commitment to its terms. Each commitment has its own account. |
| PDA (program-derived address) | An address deterministically derived from inputs and a program ID | VowPool uses PDAs for group and commitment records, and as the vault's token authority. A PDA has no member's private key; the program can authorize actions for it when its rules pass. |

For example, when a member stakes 5 test tokens, their wallet signs, 5 tokens move from their member ATA to the group vault, the commitment account changes to active, and the group account updates its accounting. The token program executes the transfer; the VowPool program checks that it is allowed.

**Wallets identify and sign; token accounts hold balances; the token program moves tokens; VowPool's group and commitment accounts store the rules and records.** Solana also has shared system and token program accounts that are not created once per commitment.

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

Unsupported/unreadable commitment records do not suppress healthy records or candidate discovery. The app links affected accounts and shows wallet-derived totals as unknown when the list may be incomplete. The confirmed group pool remains independent of those display totals; no unreadable record is treated as failure or erased onchain.

A/B/C require recorded approval by the review cutoff. D accepts only the exact PR/branch with `activated_at < merged_at <= goal_deadline`. API errors are UNKNOWN. Inconclusive verification more than 48 hours after review becomes a distinct unresolved refund. Outcome and payout are separate; failed token delivery leaves a retryable entitlement. Permissionless peer expiry, recorded refund and D unresolved resolution work from the detail page. Pool withdrawal uses only recorded forfeitures and the fixed treasury recipient, protecting active escrow and unpaid refunds. Donations do not create spendable pool credit.

AI drafts schema-validated configuration for explicit user review. It cannot generate executable workflows, approve completion or move funds. Repository/PR identifiers absent from the user’s input are cleared and requested. Rate/size bounds protect the server routes. Mainnet and real funds are outside this demo.

## UI design

The approved minimal Pact Club design uses ivory, forest green, editorial type and a ripple mark. One navigation row leads to Commitments, Reviews and Pool; full terms and reviewer records live in the focused detail view.

See [the product spec](docs/2026-10-07-accountability-mvp-design.md), [design QA](design-qa.md), and [implementation notes](docs/pact-club-design.md). Screenshots of populated lists use explicitly labeled development fixtures. The temporary fixture route is removed from the production app. UI screenshots do not establish new Devnet transaction evidence or a deployed CRE workflow.
