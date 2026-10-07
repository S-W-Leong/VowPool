# Minimal Pact Club implementation

7 October 2026 · Singapore

Approved reference: `design-evidence/reference.png`. Branch: `shiwei/pact-club-design`, isolated from the original checkout at its committed HEAD. The original checkout’s uncommitted and concurrent integration work was not copied or modified.

The dashboard uses Commitments, Reviews and Pool as its only navigation. Compact balances replace metric cards. Plain commitment rows show a goal, stake, relevant deadline/status and contextual action. Creation/detail replace the list while open; full frozen terms, reviewer decisions and account links remain available there. Pool contains group commitments and the existing restricted treasury controls. Permissionless processing is accessible through group commitment details.

Reviewer invitations require opening the original terms before accepting. Completion reviews remain separate. Refund rows invoke the existing refund transaction path. Display copy distinguishes automated verified outcomes, pending evidence and unresolved refunds. Tests cover the review inbox, acknowledgment versus approval, deadline boundaries and recorded refunds.

The forms share the ivory/forest/serif theme. Goal and success criteria come first; AI drafting stays collapsed and manual configuration remains available. Required terms confirmation, wallet signatures, transaction phases and confirmed-state reloads remain in place.

Typography is self-hosted DM Sans (Google Fonts v17) and Libre Caslon Text (v5). Sources: https://fonts.google.com/specimen/DM+Sans and https://fonts.google.com/specimen/Libre+Caslon+Text. OFL license files accompany the fonts in `apps/web/public/fonts`. Local font files remove a runtime Google Fonts request. The ripple asset was generated for this design and stored in the web app’s public directory. No application dependencies or lockfiles changed. Next.js 15.5.9 supports `devIndicators: false`, verified against its installed config type; this hides developer chrome in local previews.

Verification: 86 tests passed, one live RPC test skipped; web subset 38 passed, one skipped; typecheck and production build passed. Browser checks covered the populated presentation with a temporary labeled fixture, navigation, creation/terms confirmation, mobile GitHub fields, detail rendering and the real production setup state/wallet dialog. The fixture harness is preserved as text for reproducibility (`design-evidence/qa-harness.tsx.txt`); it is not a shipped route or an outcome authority.

No group address or connected member wallet was configured in the isolated checkout. No Devnet transaction was submitted and no deployment was performed for this UI change. Build warnings from the existing stack include pure-JavaScript bigint fallback and experimental Node SQLite. They did not fail the build.
