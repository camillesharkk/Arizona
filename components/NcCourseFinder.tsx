import { ncCourses, ncOfficial } from "@/data/nc-resources";

export function NcCourseFinder() {
  return (
    <section id="courses" className="card" style={{ scrollMarginTop: 100 }}>
      <h2>Find an Approved Course</h2>
      <p>Start with the Secretary of State's ordinary-notary guidance. These college pages provide initial Notary Public Education course information and enrollment steps. Check the college page for current dates, fees and delivery arrangements.</p>
      <p><a href={ncOfficial.become} target="_blank" rel="noreferrer">Secretary of State course guidance</a>{" · "}<a href={ncOfficial.colleges} target="_blank" rel="noreferrer">NC Community College directory</a></p>
      <ul>
        {ncCourses.map(course => (
          <li key={course.name} style={{ marginBottom: 18 }}>
            <a href={course.url} target="_blank" rel="noreferrer">{course.name} — Notary Public Education</a>
            <p>{course.registration}</p>
            {"registrationUrl" in course ? <a href={course.registrationUrl} target="_blank" rel="noreferrer">Open registration catalog</a> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
