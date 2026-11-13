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

## Production release

Production deployment evidence is added after the authorized main push and formal-domain checks.
