# Integration checkpoint (in progress)

Started 7 October 2026, 15:46 Asia/Singapore. Same checkout and `main`, as requested.

Pinned tools: Node 24.11.1, Bun 1.3.11, host Rust 1.96.0, Anchor 0.32.1, Agave/Solana 2.3.0, CRE CLI 1.37.0. Tools live in ignored `.tools/`. Root Bun lockfile pins JS dependencies. Anchor's documented compatible Solana release is 2.3.0: https://www.anchor-lang.com/docs/updates/release-notes/0-32-1.

CRE `whoami` and unattended `init` failed with **authentication required**. Browser login has been opened; account creation/authentication belongs to the user. No simulation, deployment or live report transaction has succeeded yet.

Authentication design checked against upstream forwarder source and documentation:

- https://github.com/smartcontractkit/chainlink-solana/blob/develop/contracts/programs/keystone-forwarder/src/lib.rs
- https://github.com/smartcontractkit/chainlink-solana/blob/develop/docs/forwarder/README.md
- https://docs.chain.link/cre/guides/workflow/using-solana-client/onchain-write-ts

`on_report` receives exactly 64 bytes of workflow metadata. CID bytes 0–31, name 32–41, owner 42–61, report ID 62–63. Enforce the configured state owner/address and PDA signer derived from `forwarder`, state, receiver under the configured forwarder program. Match immutable workflow identity; a shared forwarder alone is insufficient.

Official docs list Devnet simulation forwarder `7kuEAA3mSC1Tz8gQjnvH7bKFda9xSPRRin9SZbH49cNK`, state `5Tipz3yhTBdVsDbaBxZkrp7Gjf3brGq5SKkxReefPMP7`; live forwarder `CXsKEJcs25TQEYU2e5jZ8QTPE3ffMLZhH6BWHrdcCCB5`, state `8QoomCQyPSkJ8WopJbX9B4HyvrFzziwvJdU8hZE6DCr9`. These are documented references, **not verified tenant configuration or deployed VowPool state**. Cross-check chain accounts and tenant access before configuring a funded group.

Disposable program/local payer/deployer/transmitter keys generated in `.tools/keys/`, permissions 0600; no existing wallet read or member key held by the server. Public program ID: `A2JT4HUJYEd3BL5xPXRiaXjvoFSMetY8zvLEPmRAxXPf`. Not deployed. Local mock forwarder is a deliberately unrestricted test double and must never be deployed to Devnet.

Verification evidence and remaining limitations will be appended as checks finish.

Checkpoint verification: compiled receiver negative tests first failed 4/5 against permissive baseline, then passed 5/5 against authenticated receiver on Solana local validator 2.3.0, with an authorized mock-forwarder CPI. `program_autofixer` returned no issues and `require_another_tool_call_after_fixing=false` for concatenated receiver/state Rust. Shared suite 48/48; Rust canonical tests 3/3.

CRE browser login succeeded. `cre whoami` reports deployment access **not enabled**. Native receiver-free simulation is being exercised; live registry deployment remains unavailable. User funded disposable keys; Devnet CLI confirmed deployer 5 SOL and transmitter 0.1 SOL. Earlier RPC faucet requests failed.

SBF Rust/Cargo is 1.84.0 from platform-tools v1.48. Cargo.lock pins compatible transitive dependencies after an MSRV/edition metadata scan: blake3 1.8.2, zeroize 1.8.2, zeroize_derive 1.4.2, proc-macro-crate 3.3.0, indexmap 2.11.4, unicode-segmentation 1.12.0. Default `anchor build` is scoped to vowpool; build native mock separately with `cargo build-sbf --manifest-path programs/mock-forwarder/Cargo.toml`.

**Native CRE local simulation passed** at 16:27 Singapore on 7 October: real GitHub PR `smartcontractkit/chainlink-solana#1652`, branch `develop`, evaluated SUCCESS under conspicuously sample timing. Binary SHA-256 `9cf00924300afae0156c5916531b3b38b375ebb22dd0244bee3ef915e1f543a2`; config SHA-256 `09cb8fee44ee3b86d27810faa8b9bf38e1d5dea8b363298234602c448156ea76`. This read external GitHub data through the native CRE HTTP capability, **did not read a VowPool account and did not submit a Solana transaction**. Command from repo root:

```sh
CRE_SOLANA_PRIVATE_KEY="$PWD/.tools/keys/cre-transmitter.json" .tools/bin/cre workflow simulate workflows/accountability --project-root cre --target local-simulation --non-interactive --trigger-index 0
```
