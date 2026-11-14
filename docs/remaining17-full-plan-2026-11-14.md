# Seventeen-state full product implementation

## Objective and authorization

The user requires the seventeen newly public states to support the complete released product, including simulations and Pro. This supersedes the prior free-launch scope. The current isolated managed worktree is based on freshly fetched main fb1f767 and uses feature/remaining17-full-20261114. Other worktrees and branches remain preserved.

## Product design

Use the existing PracticeLaunch, ExamRunner, QuestionsClient, StudyGuide, StudyCardsClient, CloudMistakes, DailyStudyClient, StateArticlePage and shared account-wide 60-day Pro. Each state receives 203 reviewed original questions including its stable first ten IDs, with 60 free and 143 Pro questions, 50 independent cards, complete guide chapters and ten sourced articles. Keep paid questions server-side and authorize bank reads, answers, full submissions and Tutor through the existing session and entitlement paths.

Comprehensive Practice initially uses forty unique accessible questions with no timer. This is an explicit site practice setting. The state's separately documented official examination specifications remain based on verified official material. Preserve one anonymous browser full practice and the existing signed-in free full-practice allowance. Pro unlocks the complete bank and repeated full practices through the existing shared product.

## Execution

- [x] Inspect current workspace and freshly fetched production main, then create the isolated full-product branch.
- [ ] Expand original state content in independent per-state files under data/full-states, preserving stable question IDs and official references. Use the FullStateLearning shape in lib/full-state-learning.ts.
- [ ] Add content validation for unique scenarios, source references, topic coverage, 203 questions, 60/143 access, fifty independent cards, authored chapters and ten articles per state.
- [ ] Replace the free-launch capability gates with complete shared routes and components. Add questions, study cards, pricing, article routes and source-correct internal links.
- [ ] Connect authorized server bank reads, authoritative full-exam validation, account full counts, wrong answers, Daily Study and Tutor for all seventeen states.
- [ ] Reuse the shared Pro checkout and validate source-state attribution, quote idempotency, active/expired rights and existing webhook/account behavior.
- [ ] Run structural, real-handler, file/PostgreSQL transaction and existing-state regressions. Build the production configuration.
- [ ] Validate every state's complete product in preview across guest/free/active-Pro/expired identities and desktop/mobile viewports. Include guide read progress, cards, topic drills, full sitting, refresh, wrong answers, Tutor and checkout entry.
- [ ] Synchronize main, integrate ordinary commits, publish and track the matching production deployment to READY. Recheck all seventeen full-product entries and existing-state core paths on the formal domain.

## Implementation ownership

Content workers own separate state JSON files and source audit notes. The coordinator owns shared architecture, generated public/server content projections, tests, integration and release. The deployed free launch remains usable while the complete candidate is developed and accepted.
