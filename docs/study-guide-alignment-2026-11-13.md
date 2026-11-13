# Study Guide alignment, November 13, 2026

## Scope and implementation

- AZ, NY, PA and LA now use `components/StudyGuide.tsx` for the full guide structure and interactions.
- NY has 5 topic chapters, PA 10 and LA 14. Each includes authored introductions, substantive reviewed concept explanations, a worked scenario, key facts, source links and review dates. Topic groups follow the existing state banks. Existing reviewed concept prose is reused with its full question context.
- Every guide includes the chapter directory, read/unread controls, exam checklist, Quick 10, state-configured full practice, study cards, wrong answers, chapter-topic actions and Pro entry.
- Chapter reading uses the current server account email and explicit state. Anonymous progress retains its existing state key. The AZ legacy guest and email keys and chapter IDs remain compatible. Progress remains browser-local, as in the existing AZ implementation.
- Current Pennsylvania bond requirements and the old-term transition were checked against the Department of State. Louisiana testament wording follows current Civil Code article 1576. The New York witness concept was corrected against current Part 182.5(b)–(d).
- The migration Skill includes a mandatory Study Guide field-by-field acceptance contract and browser requirements. Both the existing local Skill and its versioned release copy were updated.

## Verification

- The original HTTP regression passed AZ and failed NY at its missing Chapters module before implementation.
- `npm run guide:verify` passes account/guest/state storage isolation, unmark persistence, legacy AZ history, real question/card topic coverage, and complete rendered chapters in all four states.
- TypeScript, production build, questions, study, quiz, auth, session and mistakes verification pass. The existing question check reports its known AZ exam-day coverage warning.
- Read-only code review found and drove fixes for account isolation, PA bond amount, LA testament wording and chapter review dates. Follow-up review found no blocking issue.
- Local Chrome checks cover anonymous NY marking and refresh, anonymous PA state isolation, actual free-account sign-in and state-specific NY/PA/LA marking, and a separate Pro account starting with independent progress. Pro PA mark/unmark updates the count and next chapter.
- Responsive browser checks cover NY, PA and LA at a narrow mobile viewport with no horizontal overflow. PA directory anchors and a chapter-topic practice link open the correct state and topic.
- Pro LA reaches 14/14 and the all-read state, which persists after refresh. Its testament action opens the eight matching study cards. An actual expired account starts with separate NY progress and can mark a chapter and retain it after refresh.

## Production release

- Code commit `9e917a4bb5779bf76e440c2e4fe5fc5ef942b10d` was pushed normally to GitHub main and matched `git ls-remote`.
- Vercel deployment `dpl_2JukYwRNJo1AEKSUv4aGzFxADcFE`, `https://arizona-p636vyx0p-sharkkk.vercel.app`, reached Ready. Vercel confirmed the `arizonanotaryprep.com` and `www.arizonanotaryprep.com` aliases. Build duration was 1 minute 15 seconds.
- `GUIDE_TEST_BASE_URL=https://arizonanotaryprep.com npm run guide:verify` passed all four guides on the formal domain. NY, PA and LA returned HTTP 200 with 5, 10 and 14 complete chapters. AZ, CA and HI guides and anonymous `/api/auth/me/` also returned HTTP 200.
- Production Chrome displayed the full NY guide. Its chapter mark changed 0/5 to 1/5, and 1/5 was observed after reload. The subsequent attempt to undo the test mark was interrupted, so restoration of that browser-local test mark is unconfirmed.
- Production PA/LA interactive rechecks remain unverified. Browser control timed out and its Windows URL-safety check then stopped further Computer Use because the active URL could not be determined reliably. Local browser acceptance and production HTTP checks are recorded separately above.
- The Vercel runtime query for this deployment from 19:53:37 to 20:03:37 Asia/Shanghai returned zero error/fatal records, with no excluded intervals or further pages.
- This follow-up record is a documentation-only change. Its final deployment state is checked in the task response.
