# Integration checkpoint (in progress)

Started 7 October 2026, 15:46 Asia/Singapore. Same checkout and `main`, as requested.

Pinned tools: Node 24.11.1, Bun 1.3.11, host Rust 1.96.0, Anchor 0.32.1, Agave/Solana 2.3.0, CRE CLI 1.37.0. Tools live in ignored `.tools/`. Root Bun lockfile pins JS dependencies. Anchor's documented compatible Solana release is 2.3.0: https://www.anchor-lang.com/docs/updates/release-notes/0-32-1.

Initial CRE authentication failure was resolved by the user through browser login. Native simulation and official mock-forwarder Devnet writes now pass. Live registry deployment remains unavailable for the current account.

Authentication design checked against upstream forwarder source and documentation:

- https://github.com/smartcontractkit/chainlink-solana/blob/develop/contracts/programs/keystone-forwarder/src/lib.rs
- https://github.com/smartcontractkit/chainlink-solana/blob/develop/docs/forwarder/README.md
- https://docs.chain.link/cre/guides/workflow/using-solana-client/onchain-write-ts

`on_report` receives exactly 64 bytes of workflow metadata. CID bytes 0–31, name 32–41, owner 42–61, report ID 62–63. Enforce the configured state owner/address and PDA signer derived from `forwarder`, state, receiver under the configured forwarder program. Match immutable workflow identity; a shared forwarder alone is insufficient.

Official docs list Devnet simulation forwarder `7kuEAA3mSC1Tz8gQjnvH7bKFda9xSPRRin9SZbH49cNK`, state `5Tipz3yhTBdVsDbaBxZkrp7Gjf3brGq5SKkxReefPMP7`; live forwarder `CXsKEJcs25TQEYU2e5jZ8QTPE3ffMLZhH6BWHrdcCCB5`, state `8QoomCQyPSkJ8WopJbX9B4HyvrFzziwvJdU8hZE6DCr9`. These are documented references, **not verified tenant configuration or deployed VowPool state**. Cross-check chain accounts and tenant access before configuring a funded group.

Disposable program/local payer/deployer/transmitter keys generated in `.tools/keys/`, permissions 0600; no existing wallet read or member key held by the server. Public program ID: `A2JT4HUJYEd3BL5xPXRiaXjvoFSMetY8zvLEPmRAxXPf`. Deployed on Devnet, with public receipt below. Local mock forwarder is a deliberately unrestricted test double and must never be deployed to Devnet.

Verification evidence and remaining limitations will be appended as checks finish.

Checkpoint verification: compiled receiver negative tests first failed 4/5 against permissive baseline, then passed 5/5 against authenticated receiver on Solana local validator 2.3.0, with an authorized mock-forwarder CPI. `program_autofixer` returned no issues and `require_another_tool_call_after_fixing=false` for concatenated receiver/state Rust. Shared suite 48/48; Rust canonical tests 3/3.

CRE browser login succeeded. `cre whoami` reports deployment access **not enabled**. Native receiver-free simulation passed; live registry deployment remains unavailable. User funded disposable keys; Devnet CLI confirmed deployer 5 SOL and transmitter 0.1 SOL. Earlier RPC faucet requests failed.

SBF Rust/Cargo is 1.84.0 from platform-tools v1.48. Cargo.lock pins compatible transitive dependencies after an MSRV/edition metadata scan: blake3 1.8.2, zeroize 1.8.2, zeroize_derive 1.4.2, proc-macro-crate 3.3.0, indexmap 2.11.4, unicode-segmentation 1.12.0. Default `anchor build` is scoped to vowpool; build native mock separately with `cargo build-sbf --manifest-path programs/mock-forwarder/Cargo.toml`.

**Native CRE local simulation passed** at 16:27 Singapore on 7 October: real GitHub PR `smartcontractkit/chainlink-solana#1652`, branch `develop`, evaluated SUCCESS under conspicuously sample timing. Binary SHA-256 `9cf00924300afae0156c5916531b3b38b375ebb22dd0244bee3ef915e1f543a2`; config SHA-256 `09cb8fee44ee3b86d27810faa8b9bf38e1d5dea8b363298234602c448156ea76`. This read external GitHub data through the native CRE HTTP capability, **did not read a VowPool account and did not submit a Solana transaction**. Command from repo root:

```sh
CRE_SOLANA_PRIVATE_KEY="$PWD/.tools/keys/cre-transmitter.json" .tools/bin/cre workflow simulate workflows/accountability --project-root cre --target local-simulation --non-interactive --trigger-index 0
```

Full lifecycle verification: 24 compiled SBF tests in LiteSVM 0.6.0, plus one real local-validator RPC test creating an SPL mint/group, funding an A commitment, recording acknowledgment/approval and returning the exact stake to the owner. `anchor test --skip-build --skip-deploy --skip-local-validator`: **25 passed, 0 failed**. Controlled-clock tests retain the actual 172800-second D grace. Frozen destination ATA makes the token CPI fail while the already-recorded refund remains retryable; thaw/retry succeeds. Donations cannot create pool credit; copied account data at a substituted PDA is rejected.

`--skip-deploy` is necessary for a program preloaded by validator genesis (genesis loader authority is the system program). Reloading the current compiled binary into a fresh local ledger fixed an initial RPC initializer mismatch; changing an on-disk `.so` does not replace an already-running validator's genesis program.

### Devnet program deployment

The full program was deployed on 2026-10-07. The public RPC rate-limited the first RPC write attempt; retry reused its buffer through QUIC and succeeded. `solana program show` confirmed the executable loader-owned account, 428,800 bytes, slot 508399160 and retained deployer upgrade authority. Public configuration and receipt are in `deployments/devnet.json`. Group/mint bootstrap still requires the fixed member roster; this receipt is not a funded commitment or live CRE receipt.

### HTTP and workflow binding

CRE SDK 1.23.0 does not expose a per-request redirect option. Official Chainlink source at `eb311970f573687b0af54d089f246262ef96d333` explicitly disables redirects in both the simulation HTTP action and real gateway (`https://github.com/smartcontractkit/chainlink/blob/eb311970f573687b0af54d089f246262ef96d333/core/capabilities/fakes/http_action.go`, `core/services/gateway/network/httpclient.go`). GitHub responses are reduced to validated fields before identical consensus, under a 256 KiB payload cap.

The actual signed report's CID/name/owner bytes are checked against the frozen group before delivery. They are not embedded in their own workflow config (which would change the workflow hash). A configured but absent group produces only a policy metadata preflight, with no chain write. Native simulation uses fixed test CID (0x11 repeated) and owner (0xaa repeated); those values are ONLY suitable for a labeled development fixture trusting the mock forwarder. A live group requires the actual deployed workflow identity, checked against registry/report evidence; never initialize a live group with simulator defaults. Any binary/config update requires a new group policy for future commitments. The receiver also independently checks metadata and forwarder PDA authorization.

The tenant supported-chains listing currently returns EVM entries and no Solana entry. Documented mock/live forwarder accounts were checked directly on Devnet: both programs are executable and their state accounts are owned by their corresponding programs. This confirms addresses, not tenant live deployment access.

### Full native staging write evidence

Native CRE CLI 1.37.0 compiled the actual generated bindings and read the deployed program, frozen fixture configuration and real public GitHub response. The official mock forwarder delivered these **real Devnet transactions**:

| Operation | Confirmed signature |
| --- | --- |
| Release recorded peer refund, 1.25 test tokens | `3XFVnHzABZn2v7ZRy9YPSeeJ1jAT67kSVfA61rXJRFfM2ZhVewQr56t7D46JHB9nBq7upzJq9zQfXt18FL8kdSh6` |
| GitHub failure: PR1652 merged before activation | `dpptbKk5WdJSMXHiMWGaHM9AmB5RkQV8xPefnzrg5frfR1RvQ1Ayz1w75LWemCyXfMpfwoyAzC7HYNrX9LepMp4` |
| Unapproved peer expiry | `5c3DFTvykwJu4bmug3SeQUQdmAR3RSJ6XDRBtBqRp2FmAwWsYKoMoMhyjN2VxfFSYdKYPdEJvrx6HZk8Q9of1bWF` |

`scripts/smoke-devnet.ts` independently confirmed all 13 fixture lifecycle/CRE receipts, exact owner balance, terminal account statuses and liability/vault accounting at 2026-10-07T09:46:23Z. Results live in `deployments/staging-fixture-verification.json`. Active/refundable: 0. Pool/vault: 2,000,000 base units. Owner: 98,000,000 base units. One failed preparation left an unfunded expired draft; it has no financial effect and stays visible.

These are fresh development wallets and simulator CID/owner metadata bound to the official public mock forwarder. **They do not prove a deployed DON identity, an actual qualifying post-activation merge, a real AI provider call or a user-member browser rehearsal.** The receiver authentication guard remains intact for live policies.

One first deadline dry run returned an unclassified capability rejection and succeeded on retry. A direct read observed Devnet Clock one second behind runtime time. To avoid future report timestamps, the workflow now validates the 40-byte Clock sysvar and uses its median Unix timestamp bounded by runtime time. The receiver's `observed_at <= Clock::get()` guard remains unchanged. Layout/source: [Agave sysvars](https://docs.anza.xyz/runtime/sysvars), installed solana-clock 2.2.3. Final native dry run passed with no writes/replays after terminal settlement.

The candidate endpoint in staging config is a temporary development tunnel. Update it before repeating the fixture; the tunnel process has no availability guarantee. Previous staging dry-run binary SHA-256: `2368ced66e91bbe02d82deda419f1baf6be387e1fee0c7bfb76cddc929a994d0`; staging config SHA-256: `53ffa60fe962669b15aa0fffbc20faad8aa97e018fd0fd6b33ac7f1801d5ac42`. Clock reads and fixture receipts establish the exercised adapter behavior; multi-node DON execution remains unverified.

### Amended RPC-reader checkpoint

The updated plan's native HTTP RPC checkpoint passed. CRE SDK 1.23.0 uses one confirmed, base64 `getMultipleAccounts` request for Clock, configured forwarder state, group and the bounded candidate batch, after a separate genesis check. Request order and null handling follow [Solana's method documentation](https://solana.com/docs/rpc/http/getmultipleaccounts). The actual IDL determines vector-prefix offsets; explicit roster/reviewer/configuration bounds precede generated-codec decoding. u64 nonce/amount values remain bigint, including values above JavaScript safe integer precision in tests.

The installed SDK's `ConsensusAggregationByFields`, `identical` and `median` APIs were checked in version 1.23.0 source before use. Semantic account fields use identical consensus; the observed context slot and validated Clock timestamp use median aggregation. Rent, lamports, account padding and unrelated group accounting are excluded from decision consensus. One malformed candidate is skipped while other valid candidates continue. If nodes disagree on relevant semantics, the entire maximum-five-item batch is deferred, rather than guessing a quorum. This can delay the other candidates until a later execution. No live multi-node result is claimed.

Native staging simulation read the actual fixture at slot **508424469**, decoded its four commitment addresses/amounts/statuses and matched the GitHub configuration hash. All were terminal or unfunded, so no report or transaction was produced. A first attempt hit a credential-service timeout; a later attempt completed without changing authentication or receiver checks.

The dedicated `rpc-check` target then passed at slot **508425389** using two configured public addresses and **no candidate API**. The GitHub account `EGhssuwcSny2qkgW5wE8tLSLW1kjD5afou75sxxGL54o` decoded nonce3, amount1000000, failed status and hash `ad13635f9749be1cb31f1e59bf18b9a95118460a163f9c4d3c36ee7729569296`. The peer account `3wJrcVre531zA5KkRGKCe7AjZrfzcoo96eokUVwWuZAx` decoded nonce4, amount1250000 and succeeded status. Both deadlines and hashes matched the independent web/Anchor reader. Public evidence: `deployments/rpc-check.json`.

`rpc-check` returns before report creation or delivery. Its binary SHA-256 is `cf035f8eac2e5924ba458d0294f89ff8ef1886502073018eb9f4c1a1bd8f66fb`; config SHA-256 is `539ff440c91349b7f20f5a172509aaa378855adb1784af4dc3b34f8b6d2201b0`. The first target attempt lacked a project-level RPC entry; adding the matching Solana Devnet target resolved it. The CLI's displayed native timestamps use this machine's Singapore wall time despite a `Z` suffix; slot numbers and runtime epoch values are the reliable cross-check here.

RPC-reader tests cover 403/429/5xx, JSON-RPC errors, timeout, malformed/oversized envelopes, null accounts, wrong owner/discriminator/group/PDA/configuration hash, truncated data, oversized vectors, continued processing and consensus normalization. CRE tests:30/30. Root suite with the actual local-validator RPC smoke enabled:124/124. TypeScript passes. These checks establish the exercised native local adapter and failure handling, not an audit or deployed DON execution.
