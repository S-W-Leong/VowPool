# VowPool MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Implement sequentially in the main chat, as required by the supplied AGENTS.md. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a runnable accountability group demo with wallet-authorized peer verification, SPL test-token escrow, and an authenticated GitHub-to-CRE-to-Solana verification path within the user's remaining eight-hour window.

**Architecture:** A Next.js web app reads authoritative accounts from one Anchor program on Solana Devnet. Server routes store supporting terms/evidence and draft user-reviewed AI configuration; they have no member keys or settlement authority. A separate TypeScript CRE workflow reads public GitHub facts and submits compact reports through the Keystone Forwarder.

**Tech Stack:** TypeScript, Next.js App Router, React, CSS, Zod, Solana wallet adapter/web3.js, Rust/Anchor, original SPL Token Program, CRE TypeScript SDK, Bun, Vitest, Anchor/local-validator integration tests.

**Spec:** `docs/2026-10-07-accountability-mvp-design.md` — existing user-provided design. The user's eight-hour remaining budget supersedes its older twelve-hour budget.

## Global Constraints

- Solana Devnet is the authoritative ledger and escrow; no Ethereum deployment, ERC-20, bridge, or second-chain implementation.
- One fixed group roster, treasurer, treasury recipient, mint and ordinary SPL Token Program. Fixed demo roster has no membership-editing function.
- A: one appointed verifier; B: all appointed verifiers; C: one eligible non-owner member; D: only `github_pr_merged_v1`.
- A/B require all reviewer acknowledgments before owner activation. Acknowledgment and completion approval are separate wallet actions.
- Peer approval cutoff is inclusive; expiry is strictly after review deadline. Early completion is allowed.
- D success requires `activated_at < merged_at <= goal_deadline` and exact target branch. Failure requires a valid non-qualifying observation strictly after goal deadline.
- API errors, unavailable resources and malformed responses are UNKNOWN, never FAIL.
- D hard resolution deadline is `review_deadline + 48 hours`; unresolved resolution is strictly after it and grants a refund, with a distinct outcome.
- Outcome recording is separate from refund transfer. Treasurer cannot consume active stakes or unpaid refunds. All arithmetic is checked.
- AI drafts configuration, never approves, executes generated code, moves funds or changes active terms. Manual configuration remains usable.
- Times display in Asia/Singapore; store integer UTC seconds. Token units are labeled test tokens and have no claimed fiat peg.
- Use CRE CLI >=1.29.0 for TypeScript generated Solana bindings (stricter than the spec's >=1.24.0 write-capability floor). Pin installed dependencies/CLI versions in lockfiles and README.
- Simulation and live CRE forwarders are distinct configurations. Simulation logs are not Devnet settlement receipts.
- No upload pipeline, recurrence, disputes, notifications, membership management, private GitHub repositories or real funds.
- No claim of immutability while program upgrade authority is retained. Keep it during debugging; publish its actual state in README.

## Review Focus

1. Token amounts above JS safe integer precision: use decimal strings and bigint/base-unit conversion; reject excess fractional precision and overflow (Task 2).
2. Wallet/network switches while signing: invalidate pending UI context, confirm against the original signature and re-read chain state (Task 5).
3. Metadata storage failure or tampering after chain creation: show missing/unverified terms and allow export/retry, without changing ledger state (Task 4).
4. Oversized/malformed GitHub responses and unsafe configuration strings: bound input and treat invalid observations as UNKNOWN (Task 6).
5. Clock boundaries and stale/out-of-order reports: accept only active, bound, eligible reports and preserve terminal outcomes (Tasks 3/6).

## Execution and time allocation

Recommended approach: main-chat sequential execution. The supplied AGENTS.md maps subagent work to sequential work, so no delegation is needed.

| Elapsed build time | Deliverable |
| --- | --- |
| 0:00–0:45 | Toolchain, receiver authentication and CRE access feasibility |
| 0:45–2:45 | Shared schemas, Anchor escrow/permissions, local integration tests |
| 2:45–5:00 | Wallet UI, metadata/evidence, one AI drafting endpoint |
| 5:00–6:15 | GitHub CRE workflow, actual Devnet lifecycle and report integration |
| 6:15–7:00 | End-to-end hardening and demo rehearsal |
| 7:00–8:00 | Recording, README, pitch and submission buffer |

These are checkpoints from the actual build start, not a new allocation at each turn. Tool installation and access delays consume the same budget. At the first checkpoint, report live CRE access/authentication status; keep optional UI cuts available. Do not silently substitute an administrator oracle signer or describe simulation as live integration.

## File map

- `programs/vowpool/src/{lib,state,error,peer,escrow,oracle}.rs`: instruction entry points, accounts, peer lifecycle, accounting, authenticated reports.
- `tests/program/{peer,escrow,oracle}.ts`: tests against compiled program on a local validator, including account substitution.
- `packages/shared/src/{schema,amount,terms,github,report}.ts`: validation, base units, canonical bytes/hash, deterministic GitHub evaluator and compact report schema.
- `packages/shared/test/*.test.ts`: domain and encoding fixtures; Rust consumes the same canonical fixture.
- `apps/web/app/{page,commitments/new/page,commitments/[address]/page}.tsx`: dashboard, creation, detail.
- `apps/web/components/{WalletProvider,CommitmentCard,TransactionStatus,TermsConfirmation}.tsx`: focused UI units.
- `apps/web/lib/{chain,transactions,metadata-store,signed-actions,ai}.ts`: chain reader/writer, confirmation, supporting storage, signed evidence, AI adapter.
- `apps/web/app/api/{metadata,evidence,challenge,configure,candidates}/route.ts`: supporting data and narrow draft/discovery APIs.
- `cre/workflows/accountability/{main,github,delivery}.ts`: trigger, public GitHub HTTP consensus/evaluation, generated binding delivery.
- `cre/project.yaml`, workflow YAML, staging/production JSON: separate simulation/live environments; no embedded secrets.
- `scripts/{bootstrap-devnet,export-deployment,smoke-devnet}.ts`: test mint/roster setup, public addresses/IDL, verified demo transactions.
- `deployments/devnet.json`: public program/group/mint/treasury/forwarder identities and actual upgrade authority; never private keys.
- `README.md`, `docs/demo.md`, `.env.example`, `.gitignore`: reproducibility and honest execution status.

### Task 1: Toolchain and receiver authentication checkpoint

**Files:** root workspace manifests, `Anchor.toml`, Cargo manifests, `programs/vowpool/src/oracle.rs`, `tests/program/oracle.ts`, `docs/integration-check.md`, `cre/` configuration.

**Interfaces:**
- Produces `on_report(ctx, metadata: Vec<u8>, report: Vec<u8>) -> Result<()>` compatible with the forwarder's Anchor discriminator.
- Authentication requires the configured forwarder program/state, PDA signer derived from `[b"forwarder", state, program_id]`, and exactly 64 bytes of metadata. Parse `workflow_cid[0..32]`, `workflow_name[32..42]`, `workflow_owner[42..62]`, `report_id[62..64]`.
- Each D commitment freezes allowed workflow CID/name/owner and policy/version; no post-creation workflow reassignment. Group initialization supplies the immutable demo policy identity. Recreating an unfunded demo group is acceptable during bootstrap.

- [ ] Install pinned compatible Solana/Anchor/CRE tooling, initialize Git and workspace, ignore `.env*` except examples, local keys, `.data`, build output and dependencies. Use newly generated disposable Devnet deploy/transmitter keys stored outside tracked source; member signing stays in browser wallets.
- [ ] Write local program tests `rejects_unsigned_authority`, `rejects_wrong_forwarder_state`, `rejects_other_workflow_cid`, `rejects_short_metadata`; run them and observe failure before adding the receiver checks.
- [ ] Implement minimal authenticated receiver and verify all negative tests plus an authorized local mock-forwarder CPI. Bind tests to the actual compiled receiver, not a TypeScript model alone.
- [ ] Check CRE login, deployment access, tenant-supported Solana chain/forwarder addresses and binding generation. Login may require the user's browser interaction; continue local work while awaiting it.
- [ ] Dry-run generated binding delivery against a Devnet receiver with a funded transmitter. Record simulation as a dry-run. Compare deployed forwarder metadata/layout with the inspected upstream source before trusting it for outcomes.
- [ ] Save concrete versions, commands, result and unresolved access limitations in `docs/integration-check.md`; commit the checkpoint.

**Acceptance:** receiver builds and rejects forged authority/metadata; actual CRE execution status is documented. Live report integration remains unverified until a deployed workflow produces a confirmed receiver transaction.

### Task 2: Frozen terms, amounts and deterministic verification

**Files:** shared files/test files listed above; `programs/vowpool/src/state.rs`; `tests/fixtures/canonical-v1.json`.

**Interfaces:**
- `VerificationMode = 'single' | 'multiple' | 'group' | 'github'`; wire enum values 0/1/2/3.
- `CommitmentDraft`: goal, criteria, stake decimal string, optional consequence, goal/review UTC seconds, mode, reviewer addresses, optional GitHub config.
- `GithubConfig`: owner (max 39 ASCII), repo (max 100 ASCII), PR positive u32, target branch (max 100 UTF-8 bytes), policy version 1. Reject path separators in owner/repo; GitHub host is hardcoded.
- `parseTokenAmount(value: string, decimals: number): bigint` rejects signs, exponent syntax, excessive precision and values outside u64.
- `encodeGithubConfig(identity, config, deadlines): Uint8Array` uses Borsh order: version u8=1, program/group/commitment 32-byte keys, owner string, repo string, PR u32, branch string, goal i64, review i64, hard i64, policy version u16=1, workflow CID[32], workflow name[10], workflow owner[20]. `hashGithubConfig(...)` SHA-256 hashes those bytes.
- `encodeTerms(draft): Uint8Array` uses a documented versioned Borsh order with normalized exact stored strings, stake u64, mode u8, ordered reviewers, deadlines and optional configuration/consequence; `hashTerms(draft)` hashes those bytes. Preserve canonical bytes in exported terms.
- `evaluateGithub(config, observation, activatedAt, goalDeadline, observedAt): 'SUCCESS' | 'FAIL' | 'PENDING' | 'UNKNOWN'` validates full response identity, boolean merge status, parseable timestamps and exact branch before evaluation.

- [ ] Write tests for fractional amounts/overflow, duplicate/self reviewers, missing PR, invalid repo paths, review <= goal and unsupported policy. Run `bun run test:shared` and observe missing implementation failures.
- [ ] Implement strict Zod schemas, bigint conversion, encoding and hashing; cap goal at 500 bytes, criteria/consequence at 2,000 bytes and roster/reviewers at 8. D has no reviewers; A exactly one, B 1–7, C none.
- [ ] Add fixed canonical fixture and Rust serialization test proving byte/hash equality; include timezone conversion fixture for Singapore local midnight.
- [ ] Add evaluator cases: timely merge, wrong PR/repo/branch, pre-activation merge, late merge, unmerged before/after deadline, HTTP error, inaccessible/deleted resource, invalid timestamp/oversized response. Implement evaluator and run shared/Rust tests.
- [ ] Commit shared interfaces and canonical fixture.

### Task 3: Authoritative escrow and four-mode lifecycle

**Files:** program files and `tests/program/{peer,escrow,oracle}.ts`.

**Interfaces:**
- Group PDA seeds `[b"group", founder]`; vault ATA owned by the group PDA; commitment PDA seeds `[b"commitment", group, owner, nonce_u64_le]`.
- Group stores roster (<=8), treasurer, treasury recipient, mint, escrow/refund/pool counters and frozen forwarder/policy identity.
- Commitment stores group, owner, nonce, terms hash, token amount u64, deadlines/activation i64, mode, immutable reviewer list, acknowledgment/approval bitmasks, lifecycle enum and refund-released flag; D also stores explicit configuration/hash and accepted result facts.
- Public instructions: `initialize_group(args)`, `create_commitment(args)`, `acknowledge()`, `activate()`, `approve()`, `settle_expired()`, `release_refund()`, `resolve_unverified()`, `withdraw_pool(amount: u64)`, `on_report(metadata, report)`.
- All instructions validate commitment/group PDA and linkage. Token instructions constrain original Token Program, exact mint, vault and recipient; owner's refund goes only to their canonical ATA (permissionlessly create it when needed).
- Lifecycle `Draft -> Active -> Succeeded | Failed | Unresolved`. Financial counters: activation increments active; success/unresolved moves active to refundable; failure moves active to pool; release/withdraw decrements its respective bucket after successful CPI.

- [ ] Write peer permission/boundary tests: outsiders/self cannot acknowledge/approve; A/B cannot activate early; B partial approvals do not succeed; C one eligible approval succeeds; duplicate approvals do not count; D rejects peer approval. Run failing tests before implementing instructions.
- [ ] Implement group/commitment creation, immutable bounds/hash checks, acknowledgment/activation and peer approval. Deadline checks use Clock; only owner activates before goal deadline. Approval records success and refund entitlement without token CPI.
- [ ] Add accounting tests using real SPL mint/accounts: exact deposit/refund, failed payout leaves entitlement, duplicate release/settlement cannot double-credit, treasurer cannot access active/refundable funds, fixed treasury recipient and wrong vault/mint/token/owner/PDA are rejected. Implement checked accounting and transfer CPIs.
- [ ] Add oracle tests with authenticated mock-forwarder CPI: wrong config/identity/policy, cross-commitment replay, future observation, early failure, stale delivery beyond hard deadline and terminal overwrite fail. Implement compact report decoding and immutable-condition rechecks.
- [ ] Test inclusive peer approval cutoff, strictly-later expiry, D expiry exclusion, qualifying report through hard deadline, unresolved strictly afterward and no double refund. Use controlled local validator Clock for the 48-hour boundary; do not shorten live grace.
- [ ] Run `anchor test` and `cargo test`; verify all suites pass; commit program and emitted IDL.

**Oracle wire payload:** Borsh `operation u8`, commitment key[32], config hash[32], policy version u16, source u8=1 (GitHub), observation i64, merged bool, merge timestamp i64 (0 when unmerged), observed target-branch SHA-256[32]. Operation 0/1=GitHub success/failure, 2=peer expiry, 3=refund release, 4=resolve unverified. Program/group identity are transitively bound by configuration hash and constrained accounts. Group/commitment are the only receiver-specific accounts for recording outcomes/expiry. Refund release uses a separate delivery with the required token accounts, minimizing report transaction size. Reject payloads with trailing bytes. Target-branch hash must match frozen branch for SUCCESS; valid non-qualifying observations may establish FAIL only after goal deadline. Fit/test serialized transactions rather than assuming the report fits Solana's packet limit.

### Task 4: Supporting metadata, signed evidence and AI drafting

**Files:** web server modules/routes and shared schema tests.

**Interfaces:**
- `POST /api/metadata`: commitment address + canonical terms. Read commitment at confirmed level, recompute hash and accept only matching bytes; immutable insert, idempotent same-content retry, reject overwrite.
- `GET /api/metadata?address=...`: stored terms with chain hash validation. Missing/corrupt data is explicit in UI.
- `GET /api/challenge?address=...`: server-generated one-time nonce, 5-minute expiry and exact versioned signMessage bytes bound to commitment/owner/action/content hash.
- `POST /api/evidence`: note (<=2,000 bytes), optional HTTPS URL, challenge and owner wallet signature; verify nonce, expiry, canonical message and onchain owner; consume nonce once.
- `POST /api/configure`: natural-language goal + mode + explicit current Singapore time; returns strict `{draft, missingFields, explanation}` with draft partial until missing fields are supplied. Never invent repo/PR or emit executable code. Configure is rate-limited per session and capped in size.
- `GET /api/candidates`: bounded discovered commitment addresses only; no outcome authority. CRE reads authoritative account data independently.

- [ ] Write tests for substituted terms, immutable overwrite, evidence signer/replay/expiry, missing storage and AI malformed/missing/unsupported config. Run failing tests.
- [ ] Implement local persistent storage using Node's SQLite API for single-instance hackathon runtime (`.data/vowpool.db` ignored), with transaction-safe immutable metadata, evidence and one-time challenges. Document local disk persistence requirement; serverless hosting requires a persistent store adapter before deployment.
- [ ] Implement one server-side structured AI call using a configured API key. Validate result; when unavailable return a clear retry/manual-entry state. Never expose key to browser and never substitute an unmarked canned AI result.
- [ ] Read OpenAI official/local docs if selecting OpenAI for the call. No account credential scavenging; use explicitly configured environment secrets.
- [ ] Run API/domain tests and commit. File upload and progress-feed endpoints remain deferred.

### Task 5: Wallet-driven demo UI

**Files:** web pages/components, `apps/web/lib/{chain,transactions}.ts`, web CSS and UI tests.

**Interfaces:**
- `readGroup(connection, group): Promise<GroupView>` and `readCommitments(connection, group): Promise<CommitmentView[]>` decode confirmed IDL accounts and join hash-verified supporting terms.
- `sendAndConfirm(action, wallet, connection): Promise<{signature, confirmedSlot}>` gets fresh blockhash, requests wallet signature, submits, checks confirmation error and re-fetches accounts before showing completion.
- Action builders mirror Task 3 instructions; no backend signer. Chain config uses exported deployment public addresses.

- [ ] Build a clean, responsive VowPool dashboard: fixed group identity, devnet/test-token indicator, communal budget/own stakes/refunds and My commitments/Needs my action/Group activity tabs. If deployment is absent, show setup status; fixture previews must be explicitly labeled.
- [ ] Build creation form with four-mode picker, manual/AI drafting, eligible verifiers, deadlines, exact token amount, GitHub fields and editable terms confirmation. Show D's 48-hour unresolved policy and peer forfeiture cutoff before submission.
- [ ] Create onchain first, then persist/export matching terms. Show metadata retry if saving fails without implying transaction failure.
- [ ] Build detail view with frozen terms, role acknowledgment, approval list, evidence, exact deadlines, contextual lifecycle actions, distinct unresolved/pending/failed labels and Devnet explorer links.
- [ ] Test rejection/failed confirmation does not claim funds are locked, duplicates are disabled, stale wallet/network context is handled, missing terms is visible, and D has no peer approval control. Keyboard-check forms and view at mobile/desktop widths.
- [ ] Run `bun run test:web`, typecheck and production build; commit web app.

### Task 6: CRE GitHub verification and settlement processing

**Files:** CRE workflow files/config, generated bindings, shared evaluator tests, integration documentation.

**Interfaces:**
- Cron trigger every 30 seconds; discovery batch max 5. Read known group/commitment accounts via a fixed configured Solana RPC using CRE HTTP capability; server candidate list is an untrusted discovery hint.
- Public GitHub request goes only to `https://api.github.com/repos/{owner}/{repo}/pulls/{number}` with validated path values; disable redirects and cap decoded payload size at 256 KiB. Response 429/404/5xx, timeout or invalid shape => UNKNOWN, log retry state, no failure report.
- Use CRE HTTP consensus over schema-validated observations and fixed deterministic evaluation; use generated Solana bindings from the actual program IDL.
- Freeze authorized workflow identity before activating D commitments; signed metadata CID/name/owner must match. Workflow/policy update requires a new group/policy for new commitments, not rewriting active terms.

- [ ] Add tests using captured schema-valid GitHub responses for success/non-qualifying/unknown cases and corrupted chain/config hash. Ensure malformed candidates cannot block subsequent items.
- [ ] Implement cron discovery/read, GitHub evaluation and compact outcome report delivery. Before goal deadline, incomplete observations remain pending; retries never alter goal/hard deadlines.
- [ ] Implement peer-expiry, unpaid-refund and post-hard-deadline unresolved processing reports that reuse the program's public guarded transition logic. Separate refund processing from outcome recording so failed token delivery cannot erase success.
- [ ] Generate bindings with `cre generate-bindings solana`; compile and simulate against staging addresses. Record dry-run output separately from transaction receipts.
- [ ] If approved tenant access is available, deploy through CRE private registry, confirm live forwarder settings, and demonstrate actual merged PR -> authorized on_report -> recorded success -> exact owner refund. Capture explorer receipt and workflow execution ID. Verify unauthorized workflow rejection.
- [ ] If live access is unavailable, preserve runnable simulation and real peer Devnet demo, label automated live settlement unverified, and flag event eligibility question for the user/mentor. Do not replace authentication with an admin key or bypass claim.
- [ ] Commit workflow, generated bindings and honest integration results.

### Task 7: Devnet deployment, full demo and submission artifacts

**Files:** bootstrap/export/smoke scripts, `deployments/devnet.json`, README and `docs/demo.md`.

**Interfaces:**
- `bootstrap-devnet.ts` accepts explicit member public keys and a Devnet deployer; creates original SPL test mint, fixed group/vault/treasury recipient, and mints test balances. Deployer/member/CRE keys are distinct roles.
- `export-deployment.ts` writes public configuration/IDL and checks cluster/genesis and actual program upgrade authority.
- `smoke-devnet.ts` records confirmed signatures and post-transaction account/balance assertions; no hardcoded fixture signatures.

- [ ] Run full local suites and build. Deploy only to Devnet, fund demo wallets with test SOL/tokens and export actual public addresses.
- [ ] Rehearse two-wallet peer flow: create, acknowledge, fund, save evidence, approve, release refund. Demonstrate another A/C goal expiring into pool and treasury restrictions. Verify B unanimity separately.
- [ ] Rehearse D AI draft/manual confirmation, active stake, actual PR merge, CRE evaluation/report and refund if live integration is available; show a GitHub API failure remaining UNKNOWN. Demonstrate unresolved 48-hour boundary on local validator.
- [ ] Browser-check the complete flow, refreshing pages and switching roles; inspect actual chain accounts/balances and receipts. No replayed local logs as confirmation.
- [ ] Write README commands, environment variables, test/deployment addresses, trust boundaries, retained/removed upgrade authority, data persistence, CRE execution limits and fallback processing steps. Prepare a short recording script and track-specific pitch in `docs/demo.md`; record through available supported tooling or hand off only the user-operated recording step.
- [ ] Reserve final hour for recording/submission. List remaining limitations explicitly; do not claim hackathon entry was submitted without a submission receipt.

## Research snapshot (7 October 2026)

- Workspace contains only the existing design document; no product source and no Git repository at inspection.
- Node 24.11.1, npm 11.6.2, Bun 1.3.11 and Rust/Cargo 1.96.0 are installed. Solana, Anchor and CRE CLIs are absent from PATH. GitHub CLI is authenticated.
- Public Solana Devnet `getVersion` and GitHub API requests succeeded. Funding/deployment were not attempted.
- CRE release API reports CLI v1.37.0 and npm reports TypeScript SDK 1.23.0. Current docs require CLI >=1.29.0 for TypeScript binding generation. Choose/pin compatible versions during toolchain checkpoint rather than mixing older tutorial examples.
- Native Solana write docs provide separate mock/live forwarder addresses and explicitly describe simulation as not broadcasting a transaction. Live addresses must be cross-checked against tenant-supported chains and deployed state.
- Official upstream forwarder source exposes authenticated 64-byte workflow metadata with the offsets specified in Task 1. Source inspection is a feasible authentication design, not proof of live deployed integration.
- Live CRE deploy approval/account access, dual-track event rules, member browser wallets/public keys and configured AI provider access remain unconfirmed. None prevent local implementation; they can block particular live demo claims.

References:
- https://docs.chain.link/cre/guides/workflow/using-solana-client/onchain-write-ts
- https://docs.chain.link/cre/guides/operations/deploying-workflows
- https://github.com/smartcontractkit/chainlink-solana/blob/develop/docs/forwarder/README.md
- https://github.com/smartcontractkit/chainlink-solana/blob/develop/contracts/programs/keystone-forwarder/src/lib.rs

## Plan self-review

The tasks cover the spec's four modes, immutable terms, distinct acknowledgments, SPL escrow, separate refund entitlements, pool protection, deterministic GitHub evaluation, authenticated workflow identity, canonical hashing, outage grace, AI/manual configuration, metadata/evidence, wallet confirmation and demo documentation. The five review-focus inputs are pinned to their owning tasks. Optional uploads/progress/physical-follow-up convenience and withdrawal UI are cut first; zero-stake commitments remain supported by the program and creation form. A live CRE demo is an access-dependent acceptance item and is never inferred from simulation.

**Review status:** Ready for user review before product implementation.
