/**
 * Simulated pricing-page outcome figures.
 * Run: npm run outcome:verify
 * Does not call payment, analytics, or the database.
 */
import {
  assertExamOutcomeDemo,
  examOutcomeDemo,
  officialSosFaqAnswer,
  relativePassLift,
  SHOW_SIMULATED_OUTCOME_DATA,
} from "../lib/content/exam-outcome-demo.ts";

let failures = 0;

function check(name: string, ok: boolean) {
  if (ok) return;
  failures += 1;
  console.error("FAIL", name);
}

try {
  assertExamOutcomeDemo();
} catch (error) {
  failures += 1;
  console.error("FAIL assert", error);
}

const software = examOutcomeDemo.softwareComparison;
const pro = examOutcomeDemo.proComparison;

check("general n", software.control.sampleSize === 100);
check("general passed", software.control.passed === 50);
check("general rate", software.control.passRate === 50);
check("software n", software.treatment.sampleSize === 100);
check("software passed", software.treatment.passed === 70);
check("software rate", software.treatment.passRate === 70);
check("software lift", software.relativeLift === 40);
check("software formula", relativePassLift(70, 50) === 40);

check("regular n", pro.control.sampleSize === 100);
check("regular passed", pro.control.passed === 60);
check("regular rate", pro.control.passRate === 60);
check("pro n", pro.treatment.sampleSize === 100);
check("pro passed", pro.treatment.passed === 75);
check("pro rate", pro.treatment.passRate === 75);
check("pro lift", pro.relativeLift === 25);
check("pro formula", relativePassLift(75, 60) === 25);
check("sample", examOutcomeDemo.totalSampleSize === 400);
check("flag default", SHOW_SIMULATED_OUTCOME_DATA === true);

const shown = officialSosFaqAnswer(true);
check("faq software", shown.includes("70% pass rate") && shown.includes("50%") && shown.includes("40% relative"));
check("faq pro", shown.includes("75% pass rate") && shown.includes("60%") && shown.includes("25% relative"));
check("faq sample", shown.includes("400") && shown.includes("July 1, 2026") && shown.includes("September 30, 2026"));
check("faq disclaimer", shown.includes("does not guarantee"));

const hidden = officialSosFaqAnswer(false);
check("hidden rates", !hidden.includes("70%") && !hidden.includes("40%") && !hidden.includes("relative improvement"));
check("hidden still official", hidden.includes("not the official Arizona Secretary of State exam"));

if (failures) {
  console.error(`${failures} failed`);
  process.exit(1);
}
console.log("exam outcome demo ok");
