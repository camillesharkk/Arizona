import { ncApplicationSteps, NC_CHECKED } from "@/data/nc-resources";

export function NcApplicationGuide() {
  return (
    <section id="first-application">
      <h2>Your first North Carolina commission</h2>
      <p>Follow these steps for an initial traditional notary appointment. Sources checked {NC_CHECKED}.</p>
      <ol>
        {ncApplicationSteps.map(step => (
          <li key={step.title} className="card" style={{ marginBottom: 16 }}>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            <ul>{step.links.map(link => <li key={link.url}><a href={link.url}>{link.label}</a></li>)}</ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
