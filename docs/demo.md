# VowPool demo and submission runbook

As of 7 October 2026, the program and labeled development fixture are on Solana Devnet. This runbook separates exercised evidence from remaining acceptance work. The submission deadline is 23:59 Asia/Singapore on 7 October, as recorded in the implementation plan. Reserve the final hour for recording and submission.

## Judge narrative (about 3 minutes)

**0:00–0:25: The problem.** Small groups make ambitious promises but struggle to agree on proof and consequences. VowPool freezes the agreement before any test-token stake enters escrow. The group can see exactly who reviews, when approval is due and what happens if nobody approves.

**0:25–1:15: Solana peer flow.** Connect owner wallet on Devnet. Show the fixed roster, test mint and confirmed balances. Create A with a clear goal, one non-owner verifier and short deadlines. Review frozen terms, sign creation and export the terms. Switch to the reviewer wallet and acknowledge the role. Switch back to the owner and fund. Save signed evidence. Reviewer approves. Show the recorded refund entitlement, then release the exact stake. Open the Devnet receipt and refresh the owner balance.

**1:15–1:50: Shared consequences.** Show an unapproved A/C goal after the review cutoff. Any caller can settle expiry. Refresh the communal pool and show that withdrawals use only forfeited funds and the fixed treasury recipient. Mention B's unanimous approval and that the compiled-program tests exercise this rule.

**1:50–2:35: Chainlink CRE.** AI can draft public GitHub PR criteria, with missing identifiers requested and explicit user confirmation. Manual entry remains available. CRE fetches the exact public PR through its HTTP capability, checks frozen chain configuration and emits an authenticated report through the configured forwarder. Show the native simulation output and real fixture receipts. Clearly say the current broadcast uses the official mock forwarder, and live DON deployment access is unavailable. The exercised PR merged before activation, so CRE correctly recorded failure. A qualifying new merge and real provider call remain pending.

**2:35–3:00: Trust and next steps.** Solana controls deadlines, permissions and funds. Supporting text/evidence has no settlement authority. API failures remain unknown, with a separate unresolved refund more than 48 hours after review. The demo uses test tokens and retains upgrade authority. Show the evidence links and state the remaining limitations.

## Exercised evidence

`deployments/devnet.json` contains the deployed program and upgrade authority. `deployments/staging-fixture.json` contains real owner/reviewer fixture transactions and three native CRE broadcast receipts. `deployments/staging-fixture-verification.json` records an independent confirmed-state check of all 13 receipts, exact owner refund and pool accounting.

The fixture shows A acknowledgment, funding, approval and 1.25-token refund; an unapproved C goal settling into the pool; and GitHub failure for an actual public merge before activation. These transactions use fresh development wallets and the official mock forwarder. They are useful adapter evidence, with live DON origin unverified. Local compiled-program tests cover B unanimity, account substitution, unauthorized/self approval, replay, D timing/outages, 48-hour unresolved refunds and protected treasury balances.

## Remaining rehearsal inputs

- Fixed public member roster, member founder, treasurer and treasury recipient. Actual member actions use browser wallet signatures. No member private key belongs in the server or chat.
- Server `OPENAI_API_KEY` configured locally, followed by one actual provider request and explicit review. Manual configuration currently works.
- Live CRE tenant approval and authoritative deployed CID/name/owner if presenting live automated authentication. Native simulation is the currently exercised integration.
- A public PR that merges after activation and before the frozen goal deadline for a qualifying success demo, if live access becomes available.

Do not relabel the existing pre-activation merge as a qualifying success. Do not shorten the onchain 48-hour unresolved policy for a recording. Show the exact controlled-clock local test for that boundary and identify it as local.

## Recording and deck

Use a browser with the actual member wallet extension. Record only the product, public receipts and labeled simulation output. Keep credentials and key files outside the recording. The pitch deck will include a recording on its demo slide after the member rehearsal. Before that, any draft deck must visibly identify pending acceptance work.

Record the walkthrough with the supported macOS screen-recording UI or have the user operate that final step. Save the actual file under `deliverables/`, embed it in the deck, and test playback in Keynote/PowerPoint. The eight-slide draft is saved as a native `deliverables/vowpool-pitch-draft.key`, with an editable PPTX counterpart. Native Keynote import and save were exercised, including the exact 1.25-token chart label. No recording is embedded yet.

The submission wording says `.ppt` or `.keynote`; current Keynote saved the native file as `.key`. Confirm that native Keynote format is accepted by the portal/organizer before final upload. Do not rename a file to imply a conversion. [Apple documents importing PowerPoint and saving as a Keynote presentation](https://support.apple.com/en-sg/guide/keynote/tan72232b56/mac). The public rehearsal preview is [temporary VowPool fixture](https://buyer-strand-hours-ross.trycloudflare.com), with local-process availability and SQLite persistence limits.

## Submission checklist

1. Review the actual public files and final limitations before publishing the repository or shared-branch push. No remote currently exists.
2. Start the production app and publish a stable hosted demo, or explicitly label a temporary tunnel with its uptime/storage limitations.
3. Rehearse wallet switching, refreshed pages, real evidence signing and confirmed account balances.
4. Complete the recording, embed it, confirm the accepted native Keynote/PowerPoint format, and upload the final deck to Google Drive with judge access.
5. Provide separate repository, hosted demo and Chainlink simulation/deployment evidence links.
6. Confirm partner-track eligibility with the organizer. The plan records Solana check-ins 2/2 and Chainlink 1/2 with RSVP closed at inspection. Do not assume this resolves eligibility.
7. Submit before the Singapore deadline and preserve the actual portal receipt. No submission has been made.
