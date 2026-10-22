import {
  examOutcomeDemo,
  formatOutcomeRange,
  SHOW_SIMULATED_OUTCOME_DATA,
} from "@/lib/content/exam-outcome-demo";

type Group = {
  label: string;
  sampleSize: number;
  passed: number;
  failed: number;
  passRate: number;
};

function Bar({
  group,
  tone,
  lift,
}: {
  group: Group;
  tone: "control" | "treatment";
  lift?: number;
}) {
  return (
    <div className="outcome-row">
      <div className="outcome-row-head">
        <strong>{group.label}</strong>
        <span className="outcome-meta">
          n={group.sampleSize} · Passed {group.passed} · {group.passRate}%
        </span>
      </div>
      <div className="outcome-line">
        <div className="outcome-track" aria-hidden="true">
          <div className={`outcome-fill is-${tone}`} style={{ width: `${group.passRate}%` }} />
        </div>
        <span className="outcome-lift">{lift != null ? `+${lift}% relative` : ""}</span>
      </div>
    </div>
  );
}

function Chart({
  title,
  control,
  treatment,
  lift,
}: {
  title: string;
  control: Group;
  treatment: Group;
  lift: number;
}) {
  const label = `${title}. ${control.label}, n=${control.sampleSize}, passed ${control.passed}, pass rate ${control.passRate}%. ${treatment.label}, n=${treatment.sampleSize}, passed ${treatment.passed}, pass rate ${treatment.passRate}%, relative improvement ${lift}%.`;
  return (
    <section className="card outcome-card" aria-label={label}>
      <h3>{title}</h3>
      <Bar group={control} tone="control" />
      <Bar group={treatment} tone="treatment" lift={lift} />
    </section>
  );
}

export function ExamOutcomeComparison({ show = SHOW_SIMULATED_OUTCOME_DATA }: { show?: boolean }) {
  if (!show) return null;
  const demo = examOutcomeDemo;
  const software = demo.softwareComparison;
  const pro = demo.proComparison;
  const subtitle = `Synthetic demonstration data · ${formatOutcomeRange(demo.periodStart, demo.periodEnd)} · n=${demo.totalSampleSize}`;
  return (
    <section className="outcome-demo" aria-label={subtitle}>
      <h2>Pass-Rate Comparison</h2>
      <p className="outcome-sub">{subtitle}</p>
      <p className="outcome-label">{demo.label}</p>
      <div className="outcome-grid">
        <Chart
          title="Software preparation comparison"
          control={software.control}
          treatment={software.treatment}
          lift={software.relativeLift}
        />
        <Chart title="Pro access comparison" control={pro.control} treatment={pro.treatment} lift={pro.relativeLift} />
      </div>
      <p className="outcome-disclaimer">{demo.limitations}</p>
      <details className="card outcome-method">
        <summary>How this simulated comparison was calculated</summary>
        <h3>Sample</h3>
        <p>
          This interface demonstration uses {demo.totalSampleSize} synthetic participant records divided into four
          independent groups of {software.control.sampleSize}. No real customer records or official examination results
          are included.
        </p>
        <p>{demo.methodology}</p>
        <h3>Software comparison</h3>
        <p>
          The simulated general-preparation group contains {software.control.sampleSize} participants, of whom{" "}
          {software.control.passed} passed. Its simulated pass rate is {software.control.passRate}%.
        </p>
        <p>
          The simulated software-preparation group contains {software.treatment.sampleSize} participants, of whom{" "}
          {software.treatment.passed} passed. Its simulated pass rate is {software.treatment.passRate}%.
        </p>
        <p>
          The relative improvement is: ({software.treatment.passRate}% − {software.control.passRate}%) ÷{" "}
          {software.control.passRate}% × 100 = {software.relativeLift}%
        </p>
        <h3>Pro comparison</h3>
        <p>
          The simulated regular-user group contains {pro.control.sampleSize} participants, of whom {pro.control.passed}{" "}
          passed. Its simulated pass rate is {pro.control.passRate}%.
        </p>
        <p>
          The simulated Pro-user group contains {pro.treatment.sampleSize} participants, of whom {pro.treatment.passed}{" "}
          passed. Its simulated pass rate is {pro.treatment.passRate}%.
        </p>
        <p>
          The relative improvement is: ({pro.treatment.passRate}% − {pro.control.passRate}%) ÷ {pro.control.passRate}% ×
          100 = {pro.relativeLift}%
        </p>
        <h3>Data source</h3>
        <p>{demo.source}</p>
        <h3>Limitations</h3>
        <p>
          These figures are simulated. They do not represent real customers, official Arizona examination statistics, or
          evidence that the platform caused an improvement in examination outcomes. They must not be used as a
          real-world marketing claim.
        </p>
      </details>
    </section>
  );
}
