import { ncApplicationSteps, NC_CHECKED } from "@/data/nc-resources";

export function NcApplicationGuide() {
  return (
    <section id="first-application">
      <h2>Your first North Carolina commission</h2>
      <p>Follow these steps for an initial traditional notary appointment. Sources checked {NC_CHECKED}.</p>
      <ol className="study-stack application-steps" role="list">
        {ncApplicationSteps.map((step, index) => (
          <li key={step.title} className="card">
            <h3 className="application-step-heading"><span aria-hidden="true">{index + 1}.</span>{step.title}</h3>
            <p>{step.body}</p>
            <ul className="row application-step-links" role="list">{step.links.map(link => <li key={link.url}><a className="btn btn-ghost card-action" href={link.url}>{link.label}</a></li>)}</ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
