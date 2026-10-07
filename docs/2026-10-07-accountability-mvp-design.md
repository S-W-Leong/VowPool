# Accountability Group — TOKEN2049 MVP Specification

Date: 7 October 2026 · Timezone: Asia/Singapore

Status: Architecture updated around 2:42pm Singapore time on 7 October 2026 following approval of four verification modes and AI-assisted configuration. Solana Devnet remains the authoritative ledger and escrow; Chainlink CRE also verifies GitHub commitments. No implementation is included. The concrete automated grace policy below is an explicit MVP default for review.

## 1. Product purpose

A trusted accountability group makes commitments, attaches monetary or physical stakes, shares evidence, and chooses peer or automated verification. AI helps translate goals into user-approved verification conditions. The app replaces manual meeting notes and spreadsheet bookkeeping with asynchronous updates and a shared ledger.

The initial users are members of the accountability group in 500 Global’s Malaysian AI Residency. The group already relies on honesty and social reputation. Detecting fraudulent screenshots or proving real-world achievements is outside this MVP.

The blockchain purpose is concrete: members trust their chosen peers’ judgment or an explicitly selected external-data policy, while commitment permissions, approval records, stake custody and financial outcomes are enforced without trusting the platform maintainer’s database.

Success means demonstrating the complete commitment lifecycle within the approximately 12-hour hackathon build budget. Test tokens are acceptable. They demonstrate custody and settlement mechanics but do not provide real monetary stakes.

## 2. Agreed rules and interpretation

- Failed funded commitments contribute their stakes to a communal budget. Forfeited money is not individually owned by members.
- Goal pursuers remind their reviewers manually through their existing messaging channels. No reminder integration is required.
- Reviewers can acknowledge their role and approve completion. There is no rejection, objection, appeal or dispute mechanism.
- Reviewer acknowledgment accepts responsibility; completion approval authorizes success. These are separate actions.
- In A/B/C, an active commitment missing required peer approvals after the review deadline forfeits its stake, even if the goal was achieved or a reviewer was unavailable. D follows its separate automated-result and outage policy.
- Unfunded commitments expire without financial penalty.
- Processing failures must not turn recorded peer approval or automated success into failure. API errors are unknown observations, never evidence of failed completion.
- Physical consequences can become new commitments with appointed verifiers. They are socially enforced.
- Peer goals remain free text; D requires structured conditions from an allowlisted template. AI drafts configuration before creation; the user confirms it. AI cannot approve outcomes, move funds, generate executable verification code, or change active terms. The MVP has one final outcome per commitment, with no automatic recurrence or prorated refund.

### Verification modes

| Mode | Eligible reviewers | Before activation | Success condition |
|---|---|---|---|
| A — Single verifier | One named group member other than the creator | That member acknowledges | That member approves |
| B — Multiple verifiers | A fixed list of distinct group members, excluding the creator | Every selected member acknowledges | Every selected member approves |
| C — Any group verifier | Any other member of the fixed group roster | No appointment acknowledgment required | One eligible member approves |
| D — Automated program | Allowlisted CRE policy; GitHub PR merged is the sole MVP template | User confirms complete configuration; no peer acknowledgment | Authorized report confirms the specified PR merged into the specified branch during the commitment period |

**Approval rule:** B retains unanimous approval, as reaffirmed in the accepted four-mode design. A/C require one eligible approval. D uses only its configured automated policy; human approval cannot override it. No mode changes after creation.

No reviewer can gain exclusive control by claiming a C commitment. An eligible member can approve directly. Approvals cannot be revoked, duplicated to count twice, or submitted by the commitment creator.

## 3. Architecture and source of truth

| Onchain — authoritative | Offchain — supporting experience |
|---|---|
| Fixed group roster and treasurer | Member display names |
| Commitment owner, token amount and identifiers | Goal text and success criteria |
| Verification mode, peer addresses or automated policy/version | Evidence notes, screenshots and links |
| Verifier acknowledgments and completion approvals | Optional progress updates |
| Goal/review deadlines, activation time and D resolution deadline | Dashboard presentation and filters |
| Structured D configuration/hash and authenticated oracle result | AI drafting, schema validation and external API requests |
| Hash of frozen commitment terms | Stored/exportable copy of those terms |
| Active escrow, refundable balances and forfeitures | Search/display caching |
| Communal pool accounting and authorized withdrawals | Existing external messaging channels |

Use a web app, one Solana program written in Rust with Anchor, one ordinary SPL Token test mint and one TypeScript CRE workflow with GitHub-verification and expiry-processing paths, plus one backend AI configuration endpoint. The demo network is Solana Devnet. Use the original SPL Token Program rather than Token-2022 extensions. Token units are labeled as test tokens, without claiming a fiat peg. There is no Ethereum deployment, ERC-20 token, bridge or second-chain implementation.

Target both TOKEN2049 Origins tracks: Chainlink — Best Workflow with CRE (primary), and Solana — Best Use of Solana. The official event page lists both. Public material checked did not establish whether the same project can enter/win both tracks or whether a simulated CRE run qualifies. Confirm those event-specific conditions in the participant portal or with mentors; target tracks are not a claim of eligibility.

### Solana account model

- A program-owned group configuration account stores the fixed roster, token mint, treasurer and treasury recipient.
- A program-owned commitment account, derived as a PDA, stores its owner, terms hash, deadlines, mode, reviewer acknowledgments/approvals, amount and lifecycle state. D additionally stores bounded GitHub configuration fields, configuration hash, policy ID/version, activation time, hard resolution deadline and accepted oracle-result fields.
- A group vault token account holds staked SPL tokens. Its transfer authority is a PDA controlled by the accountability program; there is no maintainer-held vault private key.
- Group accounting records active stakes, unpaid refunds and available forfeited budget separately. Validate the vault address, PDA derivation, mint and token-program ownership on every relevant instruction.
- Member actions require their own wallet signer. PDA-authorized token transfers use cross-program invocations into the SPL Token Program.

PDAs provide program-controlled authority, not automatic correctness: every instruction must constrain the supplied accounts and recipients. Account rent and transaction fees are paid in devnet SOL, separately from stake tokens. Do not close active commitment/vault accounts or count rent as communal funds.

The browser connects to each user’s wallet for transactions. The offchain service never signs approval transactions on a reviewer’s behalf and never holds member private keys.

The dashboard reads financial state and review state from program accounts/events. Any metadata database or event index is a convenience layer, not an outcome authority. It cannot manufacture approvals, rewrite rules or redirect a payout.

### Remaining trust boundaries

- Peers are trusted to assess real-world completion honestly.
- The treasurer is trusted to spend forfeited communal funds appropriately. Withdrawals are publicly recorded.
- The blockchain and deployed program enforce the financial rules and wallet permissions.
- Offchain evidence hosting can fail or withhold content. Hashes detect changes but do not recover missing content.
- For A/B/C, CRE triggers execution without deciding completion. For D, an authorized CRE workflow evaluates GitHub data under a frozen policy; Solana authenticates its result and enforces the permitted transition.
- GitHub remains the trusted external source. Oracle consensus does not prove meaningful work or honest repository administration; D proves a specified merge, not quality or authorship.
- D also trusts its deployed CRE workflow and operators/update authority. Publish the policy version/code and disclose who can update it; immutable Solana logic alone does not make oracle logic immutable.

Do not pitch this as eliminating every form of trust or independently proving achievements.

## 4. Commitment lifecycle

### AI-assisted configuration

The user describes a goal and chooses A/B/C/D. AI proposes clearer criteria/evidence for peer modes; for D it fills the fixed `github_pr_merged_v1` template. “Merge my login feature into main by Friday” becomes a specific repository, PR number, target branch and deadline. Ask for missing details; never invent repository identifiers or PR numbers. Display relative dates as explicit dates in Asia/Singapore before confirmation.

Validate structured model output against a strict schema and template allowlist. Do not execute generated code, arbitrary URLs, model-supplied payment addresses or dynamically generated CRE workflows. GitHub requests use a fixed API host and validated parameters. Unsupported goals such as proving sleep should suggest peer verification.

The user reviews/edits the draft and confirms a plain-language terms summary before onchain creation. Manual entry of the same configuration remains available if AI fails. AI has no wallet keys or outcome authority. After creation, altered terms require a new unfunded commitment.

### Create and acknowledge

The creator records a commitment with goal text, success criteria, stake, goal deadline, review deadline and approval mode. Monetary amounts may be zero for physical follow-up commitments.

The program records the owner, frozen terms hash, deadlines and reviewer configuration. All selected reviewers must be valid group members and distinct from the owner. Terms are immutable from onchain creation so reviewers acknowledge the same version. An unfunded mistake is resolved by creating another commitment.

A/B reviewers acknowledge through their own wallets. All required acknowledgments must be present before activation. C/D require none. D validates its template and complete structured configuration before creation; settlement never interprets the goal prose.

### Fund and activate

Only the owner can fund/activate. For a positive stake, the owner signs a transfer of the exact amount from their token account into the validated program-controlled vault. No ERC-20 allowance step is used. Activation must happen before the goal deadline and after all required acknowledgments. A zero-stake commitment follows the same activation and review rules without token transfer.

Activation records its onchain timestamp, the earliest eligible merge time for D. Once active, the owner cannot cancel, withdraw the stake early, change reviewers or verification configuration, alter deadlines or escape by leaving the group. The fixed demo roster has no membership-editing function.

### Peer evidence and approval — A/B/C

The owner posts evidence offchain. A note and URL are sufficient for the core demo; file uploads are optional. The reviewer checks the original terms and evidence, then sends a direct onchain completion-approval transaction.

Early completion is allowed: a reviewer may approve an active commitment before its goal deadline when they consider its agreed criteria fulfilled. Approval must be included onchain at or before the review deadline. The interface warns that clicking or signing alone is not recorded approval.

For B, the program records each distinct approval and succeeds only when all required approvals exist. Partial approvals are insufficient at expiry.

### Automated verification — D

Only public GitHub PR verification is in scope. Freeze repository owner/name, positive PR number, exact target branch, `github_pr_merged_v1` policy/version, goal deadline and resolution policy onchain. Use bounded string lengths and keep these explicit fields in the commitment account; do not depend on a metadata database to recover the conditions. Store a SHA-256 configuration hash for report binding.

Canonical encoding uses a fixed versioned Borsh field order, UTF-8 strings, integer UTC timestamps and fixed-width numeric fields. Publish the encoding and use identical bytes in client, workflow and program. Reports also bind the program, group and commitment identity to prevent cross-commitment replay.

Success requires the exact specified PR to have `merged = true`, the correct target branch and `activated_at < merged_at <= goal_deadline`. An already-merged PR at staking time, a late merge, a closed-but-unmerged PR, a title or a screenshot cannot establish success. CI, code quality and authorship checks are deferred.

CRE fetches the configured PR through GitHub’s API and checks those conditions. A qualifying merge may succeed early. Before the goal deadline, incomplete/non-qualifying observations remain pending. Strictly after the goal deadline, a valid API response showing no qualifying merge may establish verified failure. Timeouts, rate limits, missing/inaccessible resources, malformed responses and API errors are `UNKNOWN`, never `FAIL`. Deleted evidence can therefore remain unresolved.

The signed report binds program/group/commitment identity, configuration hash, policy ID/version, observation time, source identity, result and supporting facts such as merge time and target branch. Solana verifies mode D, authorized report delivery, these bindings, immutable conditions, timestamp bounds and unsettled state. It records the result separately from payout. A public caller cannot forge an oracle result or use it to approve A/B/C.

### D retries, grace and unresolved outcome

**MVP default to review:** D’s ordinary review deadline is its target reporting time. Its hard resolution deadline is `review_deadline + 48 hours`, stored at creation and displayed before staking. No valid report by the review deadline means “Verification pending — retrying,” not forfeiture. Retry API checks and report delivery during the fixed grace period; the goal completion deadline never changes.

A qualifying success report can be recorded through the hard deadline even after the ordinary review deadline, since the external merge timestamp proves timely completion. A valid failure report observed strictly after the goal deadline and accepted within the hard deadline forfeits the stake. Reject future observation times and reports outside the accepted window. Early incomplete observations cannot establish failure.

When the onchain clock is strictly greater than the hard deadline and no conclusive result is recorded, anyone can call `resolve_unverified` to record `UNRESOLVED` and allocate a full refund entitlement. This works even if CRE recorded no error: missing data cannot become failure. No late report overwrites success, failure or unresolved resolution. This bounds lockup and favors avoiding wrongful forfeiture; unavailable/deleted evidence may lead to an unresolved refund, an acknowledged tradeoff rather than completed achievement. Exercise the 48-hour boundary on a controlled local validator clock, without changing active Devnet terms.

### Success/unresolved refund

The decisive peer approval or authorized automated success records success and allocates a refund entitlement. D’s unresolved path allocates the same financial entitlement with a distinct `UNRESOLVED` outcome. Neither is failure. Outcome recording does not depend on successful token transfer in that transaction.

A separate permissionless refund-release function sends the exact stake only to the recorded owner. Anyone, including CRE, may trigger this release; the caller cannot change the recipient or amount. If token transfer fails, the success/unresolved outcome and refund entitlement remain recorded and release can be retried. Successful release cannot happen twice.

For zero-stake commitments, success or unresolved resolution completes the commitment without a token refund; history preserves the distinct outcome.

### Peer expiry and forfeiture — A/B/C

The goal deadline ends the goal period. It does not itself forfeit funds; the later review deadline is the approval cutoff.

Use the Solana Clock sysvar for deadline checks. Approval is valid when the onchain timestamp is less than or equal to the review deadline. Expiry settlement is allowed only when it is strictly greater.

After the review deadline, an active A/B/C commitment missing required approvals is eligible for forfeiture. Peer expiry rejects D; passing D’s review deadline alone cannot authorize forfeiture. A permissionless `settle_expired(commitmentId)` records failure and moves its stake from active escrow accounting into the communal pool. This is an internal accounting change; funds remain held by the program until an authorized pool withdrawal.

The UI shows “Expired — settlement pending” until that transaction is confirmed. Late automation does not extend the approval window. Already approved commitments cannot be forfeited.

An approval transaction that was never recorded successfully before the cutoff does not qualify, even if a user clicked early. This differs from a failed payout after recorded approval, which remains retryable.

### Physical follow-up

For a failed commitment with a physical consequence, the owner can create a new zero-stake commitment describing that consequence, choose reviewers and set deadlines. Link it to the original commitment for context. New reviewers acknowledge normally; old approvals/evidence are not inherited.

Creation is manual; no automatic chain of punishments is generated. If time is tight, reuse the ordinary creation form and put the original commitment ID in its text.

## 5. Program permissions and accounting

The demo program has a fixed group roster, one fixed token mint and one fixed treasurer. There is no active-term editing, arbitrary outcome override or administrator rescue of active stakes. Deploy and test first, then remove the program upgrade authority before claiming that the maintainer cannot replace its logic. Publish verification of the final authority state. If upgrade authority is retained during development, disclose that remaining maintainer power; do not claim immutability yet.

Suggested public operations: create commitment, acknowledge reviewer role, fund/activate, approve completion, release refund, settle expired commitment, receive authenticated D reports, resolve unverified D commitments after the hard deadline, withdraw communal funds, and read commitments/balances. Exact function signatures belong in the implementation plan.

Only the treasurer can withdraw, and only up to the available forfeited pool balance. Withdrawal must go to the fixed treasury recipient. Active stakes and all unpaid refund entitlements, including unresolved refunds, are unavailable to the treasurer.

Accounting distinguishes:

1. Active funded stakes.
2. Successful or unresolved commitments with unpaid refund entitlements.
3. Available forfeited communal budget.

The token balance must cover the sum of these liabilities. Unsolicited token transfers do not create spendable pool credit. Each commitment has one terminal outcome (`SUCCESS`, `FAILURE` or D-only `UNRESOLVED`); each payout happens at most once. Only failure credits the pool.

Fund-moving instructions validate signer authority, PDA seeds, account ownership, writable accounts, fixed mint, vault authority, SPL Token Program identity and exact destination token-account ownership/mint. State transitions and CPI transfers must be safe against replay and substituted accounts. Use the ordinary SPL Token mint with no transfer-fee extensions and no freeze authority; any retained mint authority can create test tokens but cannot authorize withdrawals from the escrow vault.

Publish the program ID, Anchor IDL, Devnet cluster, mint/vault addresses and minimal interaction instructions so members can use another interface if the website disappears. These must be completed as part of the build handoff, not invented in this spec.

## 6. CRE integration

One fixed workflow routes candidates by frozen mode. For D it reads the GitHub configuration, fetches API data with the HTTP capability, evaluates the allowlisted template and generates a signed report. The deployed capability uses oracle-network execution/consensus; local simulation does not demonstrate multi-node execution. AI does not participate in final verification.

CRE runs on a schedule. For discovery, its HTTP capability queries Solana JSON-RPC account data (such as getProgramAccounts/getAccountInfo) and decodes the relevant commitment accounts. Do not assume a native CRE Solana Read capability. It triggers program execution for eligible A/B/C expiries, D external checks, D unresolved processing after the hard deadline, and unpaid refunds where supported within the available time. RPC data can affect discovery availability; the onchain program independently validates every requested operation.

Any index or cached candidate list is only a discovery hint. The program rechecks eligibility on every execution. A forged candidate ID cannot authorize an early forfeiture, override an approval or redirect money.

Use CRE’s native Solana Write capability, which delivers DON-signed reports through the Keystone Forwarder to the receiver program’s on_report instruction. Encode the payload with the documented Solana/Borsh format and supply the correctly ordered required accounts and account hash. Use CRE CLI v1.24.0 or later and compatible SDK/bindings; generate typed helpers from the Anchor IDL.

The receiver validates the expected forwarder authority/PDA and an allowlisted D workflow identity/policy through authenticated metadata or an equivalent authenticated route supported by the documented receiver interface. A payload policy label is not authentication. Verify the concrete mechanism in the first integration check: trusting any workflow delivered by a shared forwarder is insufficient for oracle outcomes. If this boundary cannot be enforced, D integration remains unverified and must not be described as secure.

Validate all group, commitment, vault, mint and recipient accounts. Processing-only reports use the same guarded logic as public expiry/refund functions. D reports additionally provide authenticated external facts and can establish an outcome only for a matching D commitment. CRE cannot approve peer modes, change terms, choose payout recipients or withdraw communal funds. Publish the authorized workflow/policy configuration; active commitments cannot be silently reassigned to another policy. Implement and exercise the receiver before claiming integration.

Do not replace this with a cron script holding an all-powerful administrator key. CRE has narrowly scoped D oracle-result and processing authority, with no peer-approval or treasury-withdrawal authority.

The workflow processes bounded batches, handles already-settled candidates safely, and retries transient write failures. One bad candidate must not indefinitely block unrelated settlements.

If CRE is unavailable, any wallet can process A/B/C expiry, release recorded refund entitlements or resolve D as unresolved after its hard deadline. Offer these fallback actions when applicable. A fallback caller cannot fabricate GitHub success/failure; D still requires an authorized report. An optional “Request automated check” action requests execution without granting outcome authority.

CRE network deployment requires access approval. Confirm account access, Devnet forwarder configuration and participant-specific track requirements early. The Solana Write docs describe local simulation as a dry run; do not present its logs as a confirmed Devnet transfer. A deployed workflow uses the live Keystone Forwarder. Separately demonstrate actual Devnet program transactions and clearly identify which CRE execution path was used. Confirm whether any simulation-based submission is acceptable; a locally simulated workflow is not a deployed automation service.

## 7. User experience

### Dashboard

One group dashboard shows available communal budget, the connected member’s active stakes and refundable amount. Tabs: My commitments, Needs my action, Group activity.

Needs my action includes reviewer invitations, acknowledged commitments ready to fund, commitments awaiting evidence, reviews and unpaid refunds. There are no automated messaging reminders.

Every card displays the owner, goal summary, stake, approval mode, relevant deadlines and current status. Financial/status values come from confirmed program account state. Display explorer links for Devnet transactions. If goal metadata is missing or its hash does not match, show that explicitly rather than displaying substituted terms as authentic.

### Creation form and AI configuration

Start with natural-language goal input and an explicit A/B/C/D picker. “Help configure” calls the AI drafting endpoint. Show suggested fields and missing-information prompts, retain manual editing, and never auto-stake from model output.

Fields: goal, success criteria, monetary stake, optional physical consequence, goal deadline, review deadline, approval mode and selected verifiers where applicable. Show dates in Asia/Singapore and store timestamps consistently. Validate review deadline is later than goal deadline, creator cannot review themselves, and selected verifiers are eligible.

D adds repository, PR number, exact target branch, fixed template/version and displayed 48-hour grace policy; hide human-verifier selection.

Require confirmation of a mode-specific summary before wallet submission. A/B/C show required approvals and forfeiture cutoff. D shows the exact merge condition, goal/reporting/hard deadlines, verified-failure rule and unresolved-refund rule. Allow export of original terms and canonical configuration.

### Commitment detail

Show frozen terms, reviewer acknowledgment/approval list, evidence notes/links, progress and chain event history. Contextual actions: Accept reviewer role, Lock stake, Submit evidence, Approve completion, Release refund, Process expired commitment, Create follow-up commitment.

D details show frozen configuration, last check status, accepted oracle facts/result and report transaction receipt. Hide human “Approve completion”; show “Resolve unverified” only after the hard deadline. Local logs are diagnostic, not recorded completion.

Role acceptance and approval of completion have visibly different labels. Disable duplicate/ineligible actions, while keeping program checks authoritative.

### Transaction feedback

Distinguish wallet signature requested, transaction submitted, confirmed, and failed/retry. Use the configured Solana commitment level consistently, re-fetch authoritative accounts after confirmation, and refresh stale blockhashes when retrying. Do not show a locked stake, recorded approval, refund or pool contribution as completed based on a click or database update.

An approved-but-unpaid commitment reads “Approved — refund available/processing.” An overdue unapproved A/B/C commitment reads “Expired — settlement pending.” Confirmed failure reads “Forfeited to communal pool.” D also shows “Automated verification pending,” “Verification unavailable — retrying,” “Verified — refund available/processing” and “Unresolved — refund available/completed.” Unknown must not appear as failed completion.

## 8. Build scope and cuts

Core: one group, fixed members, one test network/token, all four verification modes, onchain acknowledgment/approval, monetary escrow, expiry, pool accounting, offchain terms/evidence note and URL, dashboard/detail/form, AI-assisted configuration with manual fallback, one public GitHub PR template, authenticated CRE verification/expiry demonstrations, D retry/unresolved handling and direct-call processing fallback.

Physical follow-up should reuse zero-stake commitments after the monetary loop is stable. Treasury withdrawal must be correctly restricted in the program; its UI can wait.

Defer group management, recurring goals, daily subgoals, partial refunds, reviewer replacement, cancellation after funding, rejections/disputes, notifications, upload pipelines, meeting transcription, AI judging, arbitrary generated verification programs, extra GitHub/CI templates, private repositories/OAuth, payment-provider verification, multiple networks and real funds.

If time slips, cut uploads, progress feeds, polished summaries and physical-follow-up conveniences before cutting authoritative approvals, escrow accounting or the GitHub-to-CRE-to-Solana demonstration. Keep AI to one structured drafting call; do not build an autonomous agent or template-builder UI. Do not substitute a database approval for an onchain approval to save time.

## 9. Verification and demo acceptance

Meaningful program checks must establish:

- Outsiders and the owner cannot acknowledge/approve as reviewers.
- A/B cannot activate before required acknowledgments.
- B cannot succeed with only a subset of required approvals.
- C accepts one eligible non-owner approval.
- D rejects peer approval; A/B/C reject oracle outcomes.
- Missing/invalid AI fields, unsupported templates, arbitrary URLs and generated code cannot create executable configuration; manual configuration remains available.
- Canonical hashes agree across client, CRE and program; substituted conditions and cross-commitment report replay fail.
- D requires an authorized workflow/policy, not merely delivery by a shared forwarder.
- Wrong PR/branch, pre-activation merges, closed-but-unmerged PRs and late merges cannot succeed; incomplete checks before the goal deadline cannot fail.
- API/delivery errors cannot trigger forfeiture, including through the public peer-expiry instruction.
- D accepts qualifying reports through its hard deadline; missing results afterward resolve to unresolved refunds and cannot be overwritten.
- Duplicate D reports or unresolved calls cannot double-credit refunds or the pool.
- Approval at the cutoff and expiry after it follow the stated boundary.
- An approved commitment cannot be forfeited, including when refund release fails.
- Duplicate settlement/refund cannot double-pay.
- Treasurer withdrawal cannot consume active stakes or refund entitlements.
- Changing/deleting offchain records does not change onchain approvals or balances.
- Substituted vault, mint, token program, commitment PDA or payout recipient accounts are rejected.
- The CRE receiver rejects an invalid forwarder authority and cannot bypass ordinary settlement checks.
- The final deployed upgrade-authority state matches the immutability claim.

The browser demo uses at least two wallets, a public GitHub repository and short deadlines. Show three commitments: (1) a peer goal acknowledged, funded, evidenced, approved and refunded; (2) a D goal configured with AI, confirmed/staked, followed by an actual PR merge, CRE API evaluation, authenticated Solana result and refund; (3) an A/C goal without approval that expires into the communal pool through CRE. Show an API failure as pending/retrying, and verify unresolved timeout/refund separately on a local validator. Show transaction receipts and distinguish actual Devnet transfers from fixture content. A B-mode test with multiple reviewers can be verified separately if too slow for the live pitch.

Deliver a runnable app, deployed Devnet program/test mint, Anchor IDL and account/cluster information, CRE workflow with reproducible execution instructions, short demo recording and a README explaining setup, trust boundaries, upgrade-authority state and execution limitations. Prepare track-specific descriptions: Solana demonstrates onchain accountability and custody; Chainlink demonstrates external API evidence, deterministic evaluation, signed Solana reports and expiry processing. AI demonstrates user-reviewed rule configuration without control over funds.

## 10. Build budget

The original 12-hour budget was established around 11:40am Singapore time. It is not a fresh 12-hour allocation at every revision. At this four-mode/AI revision around 2:42pm, roughly three hours have elapsed; preserve the actual event cutoff and submission buffer. These time blocks describe prioritization and must be compressed to the remaining time.

Because Solana tooling and the CRE receiver may be unfamiliar, the first feasibility check is a public GitHub API read plus the authenticated CRE-to-Solana result path on a minimal Devnet program. If it fails, cut optional UI and follow-up features first. Report the execution limitation honestly; do not silently introduce an EVM deployment or claim an untested Solana integration.

| Budget | Focus |
|---|---|
| 1 hour | Confirm dual-track rules; GitHub API read and authenticated CRE Solana report feasibility |
| 3 hours | Anchor program/SPL mint, lifecycle, accounting and meaningful checks |
| 4 hours | Dashboard/forms, one AI drafting call, GitHub fields and wallet-driven review flow |
| 2 hours | CRE GitHub/expiry integration and refund/retry/unresolved verification |
| 2 hours | Deployment, recording, documentation and submission |

This is a prioritization budget, not a claim that unfamiliar integration work is guaranteed to fit. Verify the CRE path early and preserve submission time.

## 11. Pitch and references

“Describe your commitment naturally. AI helps formalize the terms, peers or Chainlink verify completion, and Solana enforces the stake. Our group already uses money and social reputation; this app removes the bookkeeping. CRE checks agreed GitHub facts and delivers signed results to Solana, while also automating expiry settlement.”

The project demonstrates decentralized enforcement of agreed procedures, not decentralized proof of personal achievement. Test tokens demonstrate the mechanism without real financial value.

Official references checked on 7 October 2026:

- [TOKEN2049 Origins official tracks](https://token2049.com/singapore/2049-origins)
- [CRE Solana Write capability and simulation behavior](https://docs.chain.link/cre/capabilities/solana-write)
- [CRE CLI v1.24.0: Solana Mainnet/Devnet write support](https://docs.chain.link/changelog/cre-cli-v1-24-0--execution-observability-and-solana-write-da749)
- [Writing to Solana with CRE](https://docs.chain.link/cre/guides/workflow/using-solana-client/onchain-write)
- [Solana program-derived addresses](https://solana.com/docs/core/pda)
- [Solana program deployment and upgrade authority](https://solana.com/docs/programs/deploying)
- [SPL token transfers](https://solana.com/docs/tokens/basics/transfer-tokens)
- [CRE workflow deployment and access requirements](https://docs.chain.link/cre/guides/operations/deploying-workflows)
- [CRE HTTP capability and deployed consensus versus simulation](https://docs.chain.link/cre/capabilities/http)
- [GitHub REST API: pull requests](https://docs.github.com/en/rest/pulls/pulls)

These references establish platform capabilities, listed track names and access requirements. They do not confirm multiple-track prize eligibility or correctness of the proposed program. Event pages/portal remain authoritative for submission rules.
