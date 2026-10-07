# VowPool — Agent Instructions

## Mission and operating mode

This is a time-constrained TOKEN2049 Origins hackathon build. Ship a working, understandable demo of commitment escrow with Solana and Chainlink CRE. Prioritize a complete verified flow, then usability, then polish. Avoid production-scale infrastructure, speculative features and unrelated refactoring.

The user's latest instructions and the current `2026-10-07-accountability-mvp-design.md` define the product. Find and read that spec before implementation; its recommended repo location is `docs/superpowers/specs/2026-10-07-accountability-mvp-design.md`. Do not reconstruct requirements from memory. If the file is missing, request its location while inspecting the repo and tooling.

When asked to build, carry authorized work through implementation and verification. Make routine reversible decisions autonomously; ask only when a missing answer materially changes scope, permissions or financial rules. Do not repeatedly request approval for agreed requirements. Document a concrete, safe assumption for minor choices; never invent an API or security guarantee.

The original 12-hour estimate was a total budget, not a fresh allocation per session. Use the actual submission deadline in Asia/Singapore when provided. Do not guess event eligibility or the remaining time. Reserve time for deployment, recording and submission.

## Read documentation before guessing

- For unfamiliar or uncertain SDK APIs, account layouts, CLI flags, version compatibility, authentication, network support or runtime behavior, check current primary documentation before implementing that detail.
- Use the Solana Developer MCP for Solana work. Call `list_sections` first for non-trivial questions; use `get_documentation` for canonical framework/library docs and `Solana_Documentation_Search` or `Solana_Expert__Ask_For_Help` for narrow questions and errors.
- Use the installed official Solana development and `chainlink-cre-skill` skills when available. Read their instructions before applying them. Use Context7 for other libraries where available, and official docs or source code as fallback.
- Match documentation to installed versions. Inspect package manifests, lockfiles and CLI versions. Prefer compatible existing dependencies over unplanned upgrades.
- Record important decisions with the source URL, relevant version and practical implication in the README or a short implementation note. Retrieve the smallest relevant documentation page; avoid repeatedly loading entire documentation corpora.
- A sample, mock, local simulator or confident model answer does not establish production capability. Verify the actual behavior needed by this project.
- If docs or tools are unavailable, state what remains uncertain and continue independent work. Do not fabricate methods, addresses, deployment access or results. Escalate a blocked critical integration promptly.

Useful primary sources:

- Solana/Anchor discovery: https://mcp.solana.com/mcp and https://solana.com/docs
- CRE Solana Write: https://docs.chain.link/cre/capabilities/solana-write
- CRE workflow guides: https://docs.chain.link/cre/guides/workflow/overview
- CRE HTTP: https://docs.chain.link/cre/capabilities/http
- CRE deployment: https://docs.chain.link/cre/guides/operations/deploying-workflows
- GitHub PR API: https://docs.github.com/en/rest/pulls/pulls

## Product and architecture boundaries

- Solana Devnet, Rust + Anchor, one ordinary SPL Token test mint, one fixed accountability group. Keep tokens clearly labeled as test tokens.
- Solana is authoritative for commitments, permissions, acknowledgments, approvals/results, deadlines, escrow, refunds and pool accounting. A database/index is a convenience layer, never an outcome authority.
- Keep personal goal text, evidence and progress offchain. Preserve/export original terms; bind frozen terms/configuration to onchain hashes.
- Four modes: A = one appointed verifier; B = all appointed verifiers; C = any one eligible non-owner group member; D = an allowlisted automated verification template. A/B require all appointed reviewers to acknowledge before activation. C/D require no peer acknowledgment.
- For D, build only public GitHub PR verification (`github_pr_merged_v1`). AI drafts schema-validated configuration, asks for missing details and obtains user confirmation before creation. Manual configuration remains available. AI never generates executable workflows, approves completion or controls funds.
- Freeze mode, verifiers/configuration, stake and deadlines at onchain creation. No unilateral edits or cancellation after activation. Role acknowledgment and completion approval are separate actions.
- A/B/C require recorded approval by the review cutoff; missing approval means forfeiture to the communal budget. D distinguishes verified failure from unavailable evidence. Follow its separate retry/grace/unresolved policy in the spec.
- The spec currently flags a D default for review: 48 hours after the review deadline without a conclusive result yields an unresolved refund. Preserve its distinct status; do not silently treat it as success or apply peer expiry to D. Surface unresolved policy questions without blocking unrelated implementation.
- Scope excludes arbitrary AI judging, private-repository OAuth, revenue integrations, multiple chains, recurring/partial goals, dispute systems and real funds. Physical follow-up and treasury UI come after the core financial demo.

## Resolve the risky integration first

At the start of work, inspect existing code, git changes, dependency versions and available tools. Preserve user work. Make a short ordered plan and keep it current; avoid another lengthy design cycle for already agreed behavior.

Work in these milestones, resuming wherever the repo already stands:

1. Prove the minimal GitHub API check → CRE report → authenticated Solana receiver path. Check workflow deployment access and the actual receiver authorization mechanism early.
2. Implement lifecycle, custody, accounting and peer/oracle permissions with focused checks.
3. Connect the creation, reviewer and commitment-detail flows to real program state.
4. Add one AI configuration call, manual fallback and readable transaction feedback.
5. Verify the three demo scenarios, deploy, document and record.

CRE is not merely a scheduler: it evaluates frozen GitHub criteria and delivers authenticated observations. Use the documented forwarder/report/account-binding flow. A shared forwarder or a policy name inside a payload alone does not prove the report came from the authorized workflow. Resolve this using current docs and an exercised receiver check; do not weaken authentication to make the demo appear to work.

Keep permissionless fallback for peer expiry, recorded refunds and D unresolved resolution. It must not let callers forge automated success/failure. Distinguish a local CRE dry run from an actual Devnet write and a deployed workflow. If deployment or secure integration is blocked, disclose the limitation and continue useful independent work; do not silently switch chains or call a custom cron script a CRE integration.

Cut uploads, progress feeds, animations, advanced summaries and follow-up conveniences first when time is tight. Do not cut authoritative state, account checks, refund safety or truthful demo evidence.

## Implementation discipline

- Prefer small explicit modules, established repo conventions and a single package manager. Do not introduce a framework or dependency without a concrete need.
- Keep model/API credentials on the server; never commit or print secrets, wallet seed phrases or private keys. Provide `.env.example` with placeholders.
- Use member wallet signatures for member actions; no backend impersonation. Verify the cluster before sending transactions. Mainnet, real-money operations and irreversible upgrade-authority removal require explicit user authorization.
- Use integer token base units and bounded account/configuration sizes. Validate signer, account ownership, PDA seeds, fixed mint, token program, vault authority and destination. Treasury spending cannot consume active escrow or unpaid refunds.
- Outcome recording and token payout are separate. An accepted success or unresolved refund entitlement survives payout failure. Make terminal outcomes and payouts safe against replay.
- Bind oracle reports to the correct program/group/commitment, configuration hash and authorized policy. Reject wrong mode, substituted accounts, out-of-window facts and duplicate outcomes.
- For D success, enforce the exact PR/branch and `activated_at < merged_at <= goal_deadline`. Early incomplete observations remain pending; API errors are unknown, not failure.
- UI state comes from confirmed chain state. Distinguish signature requested, submitted, confirmed and failed/retry. Re-fetch after confirmation; never display success from a button click or database write alone.

## Verification and delivery

Whenever you write or modify Solana program Rust, run the MCP `program_autofixer` before handing it back. Apply relevant fixes and rerun until `require_another_tool_call_after_fixing` is false. If unavailable, disclose that and use appropriate local checks; do not claim the MCP check passed. The checker does not replace executable tests or constitute an audit.

Run focused tests that protect meaningful invariants: unauthorized/self approvals, B's unanimous rule, deadline boundaries, mode separation, oracle authentication/binding, API failure handling, unresolved refunds, substituted accounts, duplicate settlement and protected treasury balances. For simple UI/copy changes, use proportionate checks rather than exhaustive test scaffolding. Read failures, diagnose the cause, fix and rerun affected checks; broaden only when justified.

The demo must show real evidence for:

1. A peer commitment funded, approved and refunded.
2. An AI-configured GitHub commitment, an actual qualifying merge, CRE verification and a recorded Solana outcome/refund.
3. An unapproved peer commitment expired into the communal pool.

Use fixtures for development only and label them. Never invent transaction receipts, test results or deployment claims. Preserve a runnable app, program ID/IDL, network and mint/vault configuration, setup commands, CRE execution instructions and honest limitations. Keep upgrade authority during iteration unless directed otherwise; disclose retained authority rather than claim immutability.

Send concise progress updates: what works, the main blocker and the next action. At handoff, report what changed, which checks actually ran, deployment/demo evidence and material limitations. Keep the README and spec aligned with approved changes; do not silently redefine financial rules.
