# Pact Club design QA

final result: passed

## Comparison target and evidence

Source visual truth: `docs/design-evidence/reference.png` (1487 × 1058 pixels, generated desktop reference nominally 1440 × 1024).

Implementation: `docs/design-evidence/desktop-final.png` (1440 × 1024 pixels, 1440 × 1024 CSS viewport, density 1). Mobile: `docs/design-evidence/mobile-final.png` (390 × 1149 full-page pixels, 390 × 844 CSS viewport, density 1). Populated commitment state uses clearly labeled fixtures; no transaction is executed by the harness. The fixture route was removed before the production build.

Reference and implementation were opened together in the same comparison input. Their native full-frame proportions are effectively equal; comparison assesses proportions with the small 3.3% generated-image size difference disclosed, without claiming an exact pixel match. No density resampling was applied. Header branding/navigation was additionally checked at readable size in `header-final.png` (1440 × 88). Form/detail text was inspected in browser accessibility snapshots and screenshots (`terms.png`, `mobile-form.png`). Actual product setup state: `production-startup.png` (1440 × 1024).

## Findings and fidelity surfaces

- Fonts/typography: Libre Caslon Text supplies editorial headings; DM Sans supplies controls and body copy, both loaded locally. Comfortable 14–15px desktop UI text, clear heading hierarchy, single main navigation. The implemented headline is intentionally calmer than the source. Mobile headings wrap naturally; detail headings wrap rather than overflow.
- Spacing/layout: open 1080px content width, fine separators, roomy rows, no card grid, second navigation row, action sidebar or hero decoration. Mobile rows stack goal/status/action without clipping. Browser measurements found scroll width equal to viewport width at 1440px and 390px, including GitHub configuration fields.
- Colors/tokens: ivory, dark forest green and muted neutral text; textual statuses supplement semantic color. Primary buttons and keyboard focus rings remain visible. Pending automated verification is neutral rather than failed.
- Assets: a real generated transparent ripple asset is used in header/pool. Initial faint linework was replaced with heavier strokes, verified in final full-view and focused header captures. No CSS or handcrafted SVG substitutes are used for the brand mark.
- Copy/content: demo amounts/goals match the reference in the QA fixture. Real product values remain chain-derived; the production startup correctly shows unavailable balances and group setup instructions. Role invitations, completion approval, verified outcomes and unresolved refunds are distinct. Real rows retain exact Singapore deadline times; expanded details retain financial terms.

## Comparison history

Initial evidence: `desktop.png`, `desktop-full.png`, `mobile.png`. [P2] Ripple linework was too faint at navigation size. Fixed by generating a heavier-stroke asset (`ripple-mark.png`). Post-fix evidence: `desktop-final.png`, `header-final.png`, `mobile-final.png`; the mark is now legible. Developer indicator obscuring mobile content was removed using the supported Next.js config. Post-fix screenshots contain no floating developer control. No remaining actionable P0/P1/P2 design issues were found.

## Interaction checks

- Single navigation changes sections; Reviews shows reviewer invitations/completion reviews in the fixture.
- Creation replaces the list, accepts manual fields, and reaches frozen-terms confirmation; edit/close returns to the appropriate screen.
- GitHub mode displays exact repository/PR/branch fields and unresolved-policy text, hides human verifier selection, and fits at 390px.
- Commitment detail renders status, deadlines, reviewer acceptance/approval and payout entitlement; unavailable terms stay explicitly labeled.
- Production app switches to Pool and back; wallet selection opens/closes the wallet dialog. No wallet connection or financial transaction was attempted.
- Production browser console had no warnings/errors. Fixtures do not validate wallet signing or live chain reads.

## Implementation checklist

Completed: minimal navigation, compact balances, simple rows, focused form/detail, responsive sizing, real brand asset/local fonts, status/inbox regression tests, production build, fixture route removal and actual startup check.

## Follow-up polish and limits

The header intentionally keeps the real wallet selector in place of the source’s decorative avatar. The quiet Refresh control is retained for confirmed-state reads. Footer discloses test tokens and retained authority. These are necessary product constraints, not decorative additions.

Live onchain interactions require `NEXT_PUBLIC_VOWPOOL_GROUP` and member wallets. They were not exercised; this result is design/browser QA, not financial integration verification.
