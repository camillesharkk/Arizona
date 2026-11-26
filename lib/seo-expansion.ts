import type { SeoGuide } from "@/lib/seo-guides";
import { officialExam, officialExamChecked } from "@/data/exam-config";
import { paths } from "@/lib/paths";

export const expandedGuides: SeoGuide[] = [
  {
    "id": "how-hard",
    "path": "/how-hard-is-the-arizona-notary-exam/",
    "title": "How Hard Is the Arizona Notary Exam?",
    "description": "The hard part is applying the right rule under a time limit. A practice score is not an official pass rate, because none is published.",
    "kicker": "Difficulty",
    "h1": "How Hard Is the Arizona Notary Exam?",
    "lede": "The difficulty is applying notary rules accurately while watching the clock. Open-book access helps you check a rule, but it does not replace knowing which rule applies. We do not have an official pass-rate dataset and do not promise an easy pass.",
    checked: officialExamChecked,
    "sections": [
      {
        "heading": "What makes a question difficult",
        "body": "A scenario can contain several distractions: a familiar customer, a pre-signed document, or a request to skip a step. First identify the requested act. Then check appearance, identity, certificate and journal requirements in the manual. Familiarity with the signer is not a shortcut around the applicable requirements.",
        "href": "/arizona-notary-study-guide/",
        "hrefLabel": "Review the Study Guide"
      },
      {
        "heading": "A practical readiness check",
        "body": "Take Quick 10 before studying. For each miss, write the rule you confused and the official reference. After reviewing those chapters, take Full 45 without looking at answer explanations. This is a study method, not a validated prediction of your official score.",
        "href": "/arizona-notary-practice-test/?mode=full",
        "hrefLabel": "Check your readiness with Full 45"
      },
      {
        "heading": "Readiness is more than a percentage",
        "body": "Compare two attempts by topic. A higher score on repeated questions may reflect memory. Explain why the wrong options fail, and note how often you needed a lookup. If the same topic causes misses twice, return to that chapter before another timed test.",
        "href": "/arizona-notary-study-guide/",
        "hrefLabel": "Review your weak chapters"
      },
    ],
    "related": [
      {
        "href": "/arizona-notary-study-guide/",
        "label": "Study Guide: review the rules behind missed answers"
      },
      {
        "href": "/arizona-notary-practice-test/",
        "label": "Practice test: Quick 10 and Full 45"
      },
      {
        "href": "/arizona-notary-exam-guides/",
        "label": "All Arizona exam guides"
      }
    ],
    "ctas": [
      {
        "href": "/arizona-notary-practice-test/?mode=quick",
        "label": "Try 10 free questions"
      }
    ]
  },
  {
    "id": "question-count",
    "path": "/how-many-questions-on-the-arizona-notary-exam/",
    "title": "How Many Questions Are on the Arizona Notary Exam?",
    "description": "Learn the exam length, plan your time and choose between a short diagnostic and timed practice.",
    "kicker": "How Many Questions Are on the Arizona Notary Exam?",
    "h1": "How Many Questions Are on the Arizona Notary Exam?",
    "lede": "The current Arizona SOS exam notice specifies 45 questions in 60 minutes. This website\u2019s Full 45 is an independent simulation of that length, not the official examination.",
    checked: officialExamChecked,
    "sections": [
      {
        "heading": "Plan time for both answers and lookups",
        "body": "Sixty minutes divided by 45 is about 80 seconds per question on average. That is a pacing calculation, not an official per-question limit. Some answers should take less time so you have room for longer scenarios and manual searches.",
        "sourceId": "sos_new_notary"
      },
      {
        "heading": "An example practice schedule",
        "body": "As a practice target, spend roughly 45 minutes on a first pass and reserve 15 minutes for checking difficult items. Follow the actual testing interface instructions about reviewing or changing answers; do not assume our practice navigation matches the vendor interface.",
        "href": "/arizona-notary-practice-test/?mode=full",
        "hrefLabel": "Practice with the 60-minute timer"
      },
      {
        "heading": "Quick 10 and Full 45 serve different purposes",
        "body": "Quick 10 is a short diagnostic with immediate feedback. Full 45 tests pacing and delays explanations until submission. Topic practice helps repair a specific gap; it should not be confused with the length of the official exam.",
        "href": "/arizona-notary-practice-test/?mode=quick",
        "hrefLabel": "Start with the short diagnostic"
      }
    ],
    "related": [
      {
        "href": "/arizona-notary-study-guide/",
        "label": "Study Guide: review the rules behind missed answers"
      },
      {
        "href": "/arizona-notary-practice-test/",
        "label": "Practice test: Quick 10 and Full 45"
      },
      {
        "href": "/arizona-notary-exam-guides/",
        "label": "All Arizona exam guides"
      }
    ],
    "ctas": [
      {
        "href": "/arizona-notary-practice-test/?mode=quick",
        "label": "Try 10 free questions"
      }
    ]
  },
  {
    "id": "passing-score",
    "path": "/arizona-notary-exam-passing-score/",
    "title": "Arizona Notary Exam Passing Score",
    "description": "Understand the official passing threshold and how to use an independent practice score.",
    "kicker": "Arizona Notary Exam Passing Score",
    "h1": "Arizona Notary Exam Passing Score",
    "lede": "The current Arizona SOS exam notice lists an 80% passing score. On this site, 36 correct answers out of 45 meet the 80% practice target. Your official result is determined by the examination provider.",
    checked: officialExamChecked,
    "sections": [
      {
        "heading": "How the practice calculation works",
        "body": "36 \u00f7 45 \u00d7 100 = 80%. In our equally weighted practice set, nine wrong answers leave 36 correct. This arithmetic explains our score display; it does not establish how the vendor scales or reports an official result.",
        "sourceId": "sos_new_notary"
      },
      {
        "heading": "Use a pass as a review checkpoint",
        "body": "Review every wrong answer even after a practice pass. Group misses by topic and check the source before retrying. A barely passing result with repeated misses in one chapter tells you where the next study session belongs.",
        "href": "/arizona-notary-study-guide/",
        "hrefLabel": "Study the missed rules"
      },
      {
        "heading": "Passing and commissioning are separate",
        "body": "An official passing result does not itself issue a commission. Complete the state application, bond and oath requirements and wait for the commission before acting as a notary.",
        "href": "/arizona/become-a-notary/",
        "hrefLabel": "Follow the commission checklist"
      }
    ],
    "related": [
      {
        "href": "/arizona-notary-study-guide/",
        "label": "Study Guide: review the rules behind missed answers"
      },
      {
        "href": "/arizona-notary-practice-test/",
        "label": "Practice test: Quick 10 and Full 45"
      },
      {
        "href": "/arizona-notary-exam-guides/",
        "label": "All Arizona exam guides"
      }
    ],
    "ctas": [
      {
        "href": "/arizona-notary-practice-test/?mode=quick",
        "label": "Try 10 free questions"
      }
    ]
  },
  {
    "id": "exam-requirements",
    "path": "/arizona-notary-exam-requirements/",
    "title": "Arizona Notary Exam Requirements",
    "description": "Separate exam registration, preparation and commission requirements before applying.",
    "kicker": "Arizona Notary Exam Requirements",
    "h1": "Arizona Notary Exam Requirements",
    "lede": "New and renewing Arizona notaries must pass the competency examination under the current SOS notice. Exam registration and a notary commission are separate steps; completing practice on this website satisfies neither.",
    checked: officialExamChecked,
    "sections": [
      {
        "heading": "Before you book",
        "body": "Read the current SOS notice and the exam provider\u2019s candidate instructions. The state page says to obtain a Candidate ID before completing the application. Confirm the current provider, accepted testing identification, equipment requirements for remote testing and accommodation procedure directly before booking.",
        "sourceId": "sos_new_notary"
      },
      {
        "heading": "Prepare with the current manual",
        "body": "Use the manual linked by the SOS. Build a checklist for identifying the act, checking identity, completing the certificate and recording the act. Use questions to uncover misunderstandings rather than memorizing answer letters.",
        "href": "/arizona-notary-study-guide/",
        "hrefLabel": "Open the Study Guide"
      },
      {
        "heading": "Check eligibility separately",
        "body": "Review the eligibility, disqualification, oath and bond requirements before purchasing supplies. Passing the exam does not resolve an eligibility problem or replace commission issuance.",
        "href": "/arizona/become-a-notary/",
        "hrefLabel": "Check the application steps"
      },
      {
        "heading": "Choose a practice mode for your gap",
        "body": "Use Quick 10 for a baseline. Review the chapter for each miss. Use Full 45 when you need to rehearse pacing. Pro gives access to the larger bank for additional scenarios; it is independent exam preparation.",
        "href": "/arizona-notary-practice-test/?mode=quick",
        "hrefLabel": "Find your first weak topic"
      }
    ],
    "related": [
      {
        "href": "/arizona-notary-study-guide/",
        "label": "Study Guide: review the rules behind missed answers"
      },
      {
        "href": "/arizona-notary-practice-test/",
        "label": "Practice test: Quick 10 and Full 45"
      },
      {
        "href": "/arizona-notary-exam-guides/",
        "label": "All Arizona exam guides"
      }
    ],
    "ctas": [
      {
        "href": "/arizona-notary-practice-test/?mode=quick",
        "label": "Try 10 free questions"
      }
    ]
  },
  {
    "id": "faq",
    "path": "/arizona-notary-exam-faq/",
    "title": "Arizona Notary Exam FAQ",
    "description": "Practical answers about format, open-book access, retakes and independent free practice.",
    "kicker": "Arizona Notary Exam FAQ",
    "h1": "Arizona Notary Exam FAQ",
    "lede": "Use these answers to plan your preparation, then verify booking instructions on the live SOS page. Our tests are original study material, not released official exam questions.",
    checked: officialExamChecked,
    "sections": [
      {
        "heading": "Before booking or paying",
        "body": "Read the SOS examination notice and the provider instructions together. The SOS page contains a current Pearson notice and older Prometric links. Verify the live registration route instead of relying on an old bookmark.",
        "sourceId": "sos_new_notary"
      },
      {
        "heading": "Turn an answer into a study action",
        "body": "After reading a format answer, take a short diagnostic. After missing a scenario, open its manual reference. After reviewing your weak topics, use a timed simulation to check your pacing.",
        "href": "/arizona-notary-practice-test/?mode=quick",
        "hrefLabel": "Take the free diagnostic"
      }
    ],
    "related": [
      {
        "href": "/arizona-notary-study-guide/",
        "label": "Study Guide: review the rules behind missed answers"
      },
      {
        "href": "/arizona-notary-practice-test/",
        "label": "Practice test: Quick 10 and Full 45"
      },
      {
        "href": "/arizona-notary-exam-guides/",
        "label": "All Arizona exam guides"
      }
    ],
    "ctas": [
      {
        "href": "/arizona-notary-practice-test/?mode=quick",
        "label": "Try 10 free questions"
      }
    ],
    "faqs": [
      {
        "q": "Is the exam open book?",
        "a": "Yes. The SOS notice says the manual is built into the examination. A physical manual is not allowed at testing sites or during remote testing."
      },
      {
        "q": "Do renewing notaries take the exam?",
        "a": "The current SOS notice requires the examination for both new and renewing notaries."
      },
      {
        "q": "What happens after a failed attempt?",
        "a": "The SOS notice allows three attempts and requires a 30-day wait to reschedule after the third failure. Verify current scheduling instructions before paying again."
      },
      {
        "q": "Does this site issue a commission?",
        "a": "No. Only the state issues the commission. Practice results are for study."
      },
      {
        "q": "What can I use for free?",
        "a": "Start Quick 10 without registration. Free topic practice uses the free questions. One free Full 45 in this browser can include Pro questions."
      },
      {
        "q": "Why use Pro?",
        "a": "Pro unlocks the full question bank and additional full practice. Check the pricing page for current access terms; it does not guarantee an official pass."
      }
    ]
  },
  {
    "id": "free-practice",
    "path": "/arizona-notary-practice-test-free/",
    "title": "Free Arizona Notary Practice Test",
    "description": "Start a free 10-question diagnostic and understand what is included before choosing more practice.",
    "kicker": "Free Arizona Notary Practice Test",
    "h1": "Free Arizona Notary Practice Test",
    "lede": "Start with 10 free Arizona notary practice questions. No registration is required to begin. Use the explanations and official references to decide what to study next.",
    checked: officialExamChecked,
    "sections": [
      {
        "heading": "What the free practice includes",
        "body": "Quick 10 draws from the free question pool and gives feedback as you answer. Topic practice lets you concentrate on a chapter. The main practice page displays the current free and total bank counts.",
        "href": "/arizona-notary-practice-test/?mode=quick",
        "hrefLabel": "Start the free Quick 10"
      },
      {
        "heading": "What one free full exam means",
        "body": "One free Full 45 in this browser can include Pro questions. Explanations appear after you submit.",
        "href": "/arizona-notary-practice-test/?mode=full",
        "hrefLabel": "Try the full simulation"
      },
      {
        "heading": "Make the first test useful",
        "body": "Keep a short error log: topic, mistaken rule, correct rule and official reference. Review the relevant chapter, then try topic questions. Ten answers provide a starting point, not proof that you have covered the entire manual.",
        "href": "/arizona-notary-study-guide/",
        "hrefLabel": "Review the rules behind your answers"
      },
      {
        "heading": "When to move beyond free practice",
        "body": "If you need more distinct scenarios or further full exams after your free attempt, compare Pro. If your first test exposes a basic misunderstanding, study that chapter first. Buying more questions does not replace understanding their explanations.",
        "href": "/pricing/",
        "hrefLabel": "See what Pro adds"
      }
    ],
    "related": [
      {
        "href": "/arizona-notary-study-guide/",
        "label": "Study Guide: review the rules behind missed answers"
      },
      {
        "href": "/arizona-notary-practice-test/",
        "label": "Practice test: Quick 10 and Full 45"
      },
      {
        "href": "/arizona-notary-exam-guides/",
        "label": "All Arizona exam guides"
      }
    ],
    "ctas": [
      {
        "href": "/arizona-notary-practice-test/?mode=quick",
        "label": "Try 10 free questions"
      }
    ]
  },
  {
    "id": "open-book",
    "path": "/is-the-arizona-notary-exam-open-book/",
    "title": "Is the Arizona Notary Exam Open Book?",
    "description": "Yes. Arizona provides its notary manual inside the exam. Paper copies are prohibited at test centers and during remote testing.",
    "kicker": "Is the Arizona Notary Exam Open Book?",
    "h1": "Is the Arizona Notary Exam Open Book?",
    "lede": "Yes. The Arizona Notary Public Reference Manual is available inside the exam. You cannot bring a paper copy to a test center or use one during remote testing.",
    modified: "2026-11-27",
    checked: "Arizona Secretary of State exam notice checked November 27, 2026.",
    "sections": [
      {
        "heading": "What reference can I use during the exam?",
        "body": "Use the manual provided by the exam. To prepare, download the current edition from the Secretary of State. The notice confirms that the manual is built in. Follow the testing provider’s instructions for how to use it.",
        "sourceId": "sos_new_notary",
        "href": "https://azsos.gov/resources/notary-manual-cover",
        "hrefLabel": "Get the current official notary manual"
      },
      {
        "heading": "Find the rule before you practice under time",
        "body": "First, use the manual’s table of contents to locate the chapter on identifying signers. Next, search for “credible person” and read the conditions around that term. Finally, set a short timer, pick a signer-identification scenario, and find the rule before choosing an answer. Try a Quick 10 to rehearse the decision. The lookup drills explain how to use the public manual while studying.",
        "href": `${paths.practice}?mode=quick`,
        "hrefLabel": "Start Free Arizona Quick 10",
        targetMode: "quick"
      }
    ],
    "related": [
      { "href": paths.study, "label": "Arizona Notary Study Guide" },
      { "href": paths.practice, "label": "Arizona Notary Practice Test" },
      { "href": paths.guidesIndex, "label": "All Arizona exam guides" }
    ],
    "ctas": [
      {
        "href": "/arizona/guides/open-book-manual-lookup-drills/",
        "label": "Try Arizona manual lookup drills",
        targetMode: "guide"
      }
    ]
  },
  {
    "id": "retake",
    "path": "/arizona-notary-exam-retake/",
    "title": "Arizona Notary Exam Retake Rules: What to Do Next",
    "description": "After a failed Arizona notary exam, the SOS notice allows three attempts, then a 30-day wait. Confirm the live booking rule before you schedule again.",
    "kicker": "Retake",
    "h1": "Arizona Notary Exam Retake Rules: What to Do Next",
    "lede": `The Arizona Secretary of State allows ${officialExam.attemptsBeforeWait} attempts. After the third unsuccessful attempt, you must wait ${officialExam.waitDaysAfterLimit} days to reschedule. The notice lists a $${officialExam.examFeeUsd} fee for each proctored exam.`,
    modified: "2026-11-27",
    checked: "Arizona Secretary of State exam notice checked November 27, 2026.",
    "sections": [
      {
        "heading": "Check the booking rule before another attempt",
        "body": "Confirm your attempt history with the current examination provider. Do not infer a free retry, an immediate appointment or an annual reset from the short SOS notice. Use the provider\u2019s current instructions for scheduling details.",
        "sourceId": "sos_new_notary"
      },
      {
        "heading": "Repair the cause of a miss",
        "body": "Use Quick 10 to identify one or two rules to revisit. Read the corresponding chapter and explain both the correct answer and why the other choices do not fit. Use the practice results to plan your review, especially if your official score report did not break down the topics.",
        "href": paths.study,
        "hrefLabel": "Review the Arizona Study Guide",
        targetMode: "guide"
      },
      {
        "heading": "Apply the rules to a fresh scenario",
        "body": "Try a different question on a topic you missed before repeating a full set. If your main problem was finding the right rule under time pressure, rehearse a manual lookup and note where you got stuck.",
        "href": "/arizona/guides/open-book-manual-lookup-drills/",
        "hrefLabel": "Try Arizona manual lookup drills",
        targetMode: "guide"
      }
    ],
    "related": [
      {
        "href": "/arizona-notary-study-guide/",
        "label": "Study Guide: review the rules behind missed answers"
      },
      {
        "href": "/arizona-notary-practice-test/",
        "label": "Practice test: Quick 10 and Full 45"
      },
      {
        "href": "/arizona-notary-exam-guides/",
        "label": "All Arizona exam guides"
      }
    ],
    "ctas": [
      {
        "href": `${paths.practice}?mode=quick`,
        "label": "Try 10 free questions",
        targetMode: "quick"
      }
    ]
  },
  {
    "id": "three-day",
    "path": "/arizona-notary-exam-three-day-study-plan/",
    "title": "Arizona Notary Exam: A 3-Day Study Plan",
    "description": "Three days of Arizona notary review: a short diagnostic, the chapters you missed, then one timed 45-question set.",
    "kicker": "Study plan",
    "h1": "Arizona Notary Exam: A 3-Day Study Plan",
    "lede": "Use this three-day plan for focused review when your test date is near. It is a suggested schedule, not a guarantee that three days is enough. Move the test if you cannot explain the rules or finish practice confidently.",
    checked: officialExamChecked,
    "sections": [
      {
        "heading": "Day 1: establish a baseline",
        "body": "Take Quick 10 and record topic-level misses. Read the manual and Study Guide sections for identification, acknowledgments and jurats. Explain the differences in your own words. End by checking the official reference for each miss.",
        "href": "/arizona-notary-practice-test/?mode=quick",
        "hrefLabel": "Take the baseline test"
      },
      {
        "heading": "Day 2: review records, fees and restrictions",
        "body": "Work through journals, seals and fees, prohibited acts and current law updates. Use the cram sheet as a checklist after reading the full explanations. Spend more time on your weakest topics rather than assigning every chapter equal time.",
        "href": "/arizona-notary-exam-cram-sheet/",
        "hrefLabel": "Use the cram checklist"
      },
      {
        "heading": "Day 3: simulate, then repair",
        "body": "Take Full 45 under the timer. Review all misses and any answers you guessed correctly. Confirm booking details on the official page. If the result exposes unresolved gaps, add study time rather than treating the schedule as a deadline.",
        "href": "/arizona-notary-practice-test/?mode=full",
        "hrefLabel": "Take the timed simulation"
      },
    ],
    "related": [
      {
        "href": "/arizona-notary-study-guide/",
        "label": "Study Guide: review the rules behind missed answers"
      },
      {
        "href": "/arizona-notary-practice-test/",
        "label": "Practice test: Quick 10 and Full 45"
      },
      {
        "href": "/arizona-notary-exam-guides/",
        "label": "All Arizona exam guides"
      }
    ],
    "ctas": [
      {
        "href": "/arizona-notary-practice-test/?mode=quick",
        "label": "Try 10 free questions"
      }
    ]
  }
];
