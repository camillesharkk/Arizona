export const SHOW_SIMULATED_OUTCOME_DATA = true;

export const examOutcomeDemo = {
  isSimulated: true,
  label: "Simulated data",

  studyName: "Arizona Notary Exam Preparation Outcome Demo",
  periodStart: "2026-07-01",
  periodEnd: "2026-09-30",
  totalSampleSize: 400,

  softwareComparison: {
    control: {
      label: "General preparation",
      sampleSize: 100,
      passed: 50,
      failed: 50,
      passRate: 50,
    },
    treatment: {
      label: "Software preparation",
      sampleSize: 100,
      passed: 70,
      failed: 30,
      passRate: 70,
    },
    relativeLift: 40,
  },

  proComparison: {
    control: {
      label: "Regular users",
      sampleSize: 100,
      passed: 60,
      failed: 40,
      passRate: 60,
    },
    treatment: {
      label: "Pro users",
      sampleSize: 100,
      passed: 75,
      failed: 25,
      passRate: 75,
    },
    relativeLift: 25,
  },

  source:
    "Synthetic demonstration dataset created for interface and calculation testing. It does not contain real customer records or official examination results.",

  methodology:
    "The demonstration contains four independent groups of 100 simulated participants. Relative improvement is calculated by dividing the difference between the two pass rates by the comparison-group pass rate.",

  limitations:
    "These figures are simulated for demonstration purposes only. They do not represent actual ArizonaNotaryPrep.com customer outcomes, official Arizona exam statistics, or a guarantee of individual results.",

  lastVerifiedAt: "2026-10-22",
} as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type OutcomeGroup = {
  sampleSize: number;
  passed: number;
  failed: number;
  passRate: number;
};

function parts(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

export function formatOutcomeDate(iso: string) {
  const { year, month, day } = parts(iso);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function formatOutcomeRange(start: string, end: string) {
  const a = parts(start);
  const b = parts(end);
  if (a.year === b.year) {
    return `${MONTHS[a.month - 1]} ${a.day}–${MONTHS[b.month - 1]} ${b.day}, ${a.year}`;
  }
  return `${formatOutcomeDate(start)}–${formatOutcomeDate(end)}`;
}

export function relativePassLift(treatmentRate: number, controlRate: number) {
  return ((treatmentRate - controlRate) / controlRate) * 100;
}

function near(actual: number, expected: number) {
  return Math.abs(actual - expected) <= 0.01;
}

export function assertExamOutcomeDemo(data: typeof examOutcomeDemo = examOutcomeDemo) {
  const groups: OutcomeGroup[] = [
    data.softwareComparison.control,
    data.softwareComparison.treatment,
    data.proComparison.control,
    data.proComparison.treatment,
  ];
  for (const group of groups) {
    if (group.passed + group.failed !== group.sampleSize) {
      throw new Error(`Simulated group does not add up: ${group.passed} + ${group.failed} !== ${group.sampleSize}`);
    }
    const rate = (group.passed / group.sampleSize) * 100;
    if (!near(group.passRate, rate)) {
      throw new Error(`Simulated pass rate ${group.passRate} !== ${rate}`);
    }
  }
  const softwareLift = relativePassLift(
    data.softwareComparison.treatment.passRate,
    data.softwareComparison.control.passRate,
  );
  const proLift = relativePassLift(data.proComparison.treatment.passRate, data.proComparison.control.passRate);
  if (!near(softwareLift, 40) || !near(data.softwareComparison.relativeLift, softwareLift)) {
    throw new Error(`Software relative lift ${data.softwareComparison.relativeLift} !== 40`);
  }
  if (!near(proLift, 25) || !near(data.proComparison.relativeLift, proLift)) {
    throw new Error(`Pro relative lift ${data.proComparison.relativeLift} !== 25`);
  }
  const sampleTotal = groups.reduce((sum, group) => sum + group.sampleSize, 0);
  if (sampleTotal !== 400 || sampleTotal !== data.totalSampleSize) {
    throw new Error(`Simulated sample ${sampleTotal} !== 400`);
  }
}

const INDEPENDENT_EXAM_ANSWER =
  "No. This is an independent exam-preparation platform and is not the official Arizona Secretary of State exam website. We are not affiliated with or endorsed by the Arizona Secretary of State or the official examination provider.";

export function officialSosFaqAnswer(show = SHOW_SIMULATED_OUTCOME_DATA) {
  if (!show) return INDEPENDENT_EXAM_ANSWER;
  const software = examOutcomeDemo.softwareComparison;
  const pro = examOutcomeDemo.proComparison;
  return [
    INDEPENDENT_EXAM_ANSWER,
    `In the simulated dataset shown below, candidates in the software-preparation group have a ${software.treatment.passRate}% pass rate, compared with ${software.control.passRate}% in the general-preparation group. This represents a ${software.relativeLift}% relative improvement.`,
    `In the second simulated comparison, Pro users have a ${pro.treatment.passRate}% pass rate, compared with ${pro.control.passRate}% for regular users. This represents a ${pro.relativeLift}% relative improvement.`,
    `This demonstration uses ${examOutcomeDemo.totalSampleSize} synthetic participant records covering the period from ${formatOutcomeDate(examOutcomeDemo.periodStart)} through ${formatOutcomeDate(examOutcomeDemo.periodEnd)}. It was created to test the presentation and calculation of outcome statistics and does not represent real customers or official examination results.`,
    "Individual results may vary. Using this website does not guarantee that a user will pass the official examination.",
  ].join("\n\n");
}

if (process.env.NODE_ENV !== "production") {
  assertExamOutcomeDemo();
}
