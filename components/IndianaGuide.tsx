import Link from "next/link";
import type { ReactNode } from "react";
import { IN_OFFICIAL_EXAM, inPaths } from "@/lib/in-site";
const faq = IN_OFFICIAL_EXAM.source;
const app = "https://apphub.notary.sos.in.gov/";
const portal = "https://inbiz.in.gov/certification/notary";
const update = "https://www.in.gov/sboa/files/SOS_Indiana-Notary-Public-Update_NEO_2024.pdf";
export function IndianaGuide({ resources = false, study = false, children }: { resources?: boolean; study?: boolean; children?: ReactNode }) {
 return <main className="wrap hero">
  <h1>{study ? "Indiana Notary Study Guide" : resources ? "Indiana official resources" : "Apply for an Indiana Notary Commission"}</h1>
  <p>For first-time traditional notary applicants. Independent exam practice on this site does not replace the state course, exam or application.</p>
  <p className="notice">Sources last checked November 13, 2026. New-system instructions use the Secretary of State FAQ published May 4, 2026.</p>
  <section className="card" id="prepare"><h2>1. Prepare your materials</h2>
   <p>Check that you are at least 18, a U.S. citizen or permanent legal resident, and an Indiana resident or primarily employed in Indiana. Review statutory disqualifications before applying. <a href={portal}>Official requirements</a>{" · "}<a href="https://iga.in.gov/laws/2026/ic/titles/33#33-42-12-1">IC 33-42-12-1</a>{" · "}<a href={update}>SOS eligibility overview</a></p>
   <ul>
    <li>Obtain a $25,000 surety bond for an eight-year term in your exact name. The bond amount is coverage, not the purchase price. <a href={`${faq}#page=5`}>Official bond requirements</a></li>
    <li>Get an Indiana State Police criminal history report dated within the last six months. Obtain it close to your application date to avoid stale-document issues. <a href="https://www.in.gov/ai/appfiles/isp-lch/">Request the ISP report</a>{" · "}<a href={`${faq}#page=5`}>Current report-age rule</a></li>
    <li>Prepare a signature sample in ink on clean white paper. Use the same name as the application. <a href={`${faq}#page=5`}>Signature instructions</a></li>
    <li>Nonresidents primarily employed in Indiana must provide employer details and upload an Employer Consent form. <a href={`${faq}#page=5`}>Nonresident instructions</a></li>
   </ul>
   <p>The SOS fee schedule in its December 2024 overview lists a $75 initial application fee. Confirm the current amount displayed in Applicant Hub before paying. Background-report, bond and stamp costs are separate and can vary. <a href={`${update}#page=4`}>Published state fee schedule</a></p>
  </section>
  <section className="card" id="apply"><h2>2. Submit your application</h2>
   <p>Use Access IN credentials to sign in to <a href={app}>Applicant Hub</a>. Complete Personal Info, Residency, Background, Bond, Signature and Payment. Upload the required documents and submit the application. <a href={`${faq}#page=3`}>Official navigation and submission FAQ</a></p>
   <p>If the automated document review flags an upload, the FAQ allows staff review or a dispute of the automated finding. An application awaiting review does not authorize notarizations. <a href={`${faq}#page=4`}>Document review instructions</a></p>
  </section>
  <section className="card" id="course-exam"><h2>3. Complete the official course and exam</h2>
   <p>After your application is submitted and approved, wait for the email saying your education course is ready. Use the top-right menu to open Learner Hub and start the assigned course. <a href={app}>Open the official notary system</a>{" · "}<a href={`${faq}#page=6`}>Official course and exam instructions</a></p>
   <p>The formal exam has 30 questions. You need at least 24 correct (80%). If you do not pass, wait 24 hours; the FAQ permits unlimited attempts and says an email arrives when the exam reopens. <a href={`${faq}#page=8`}>Official passing score</a>{" · "}<a href={`${faq}#page=6`}>Official retake policy</a></p>
   <p>Check the Enrolled Courses and Exams tabs in Learner Hub for completion status. The new-system FAQ does not instruct first-time applicants to separately upload exam scores. Follow any instructions shown in your official account; do not send this site's practice score as proof. <a href={`${faq}#page=7`}>Check course and exam status</a></p>
  </section>
  <section className="card" id="appointment"><h2>4. Check your appointment</h2>
   <p>Once the state has approved your commission, open Learner Hub → My Commission to view and download the active commission certificate. Course access or a practice result is not commission approval. <a href={`${faq}#page=8`}>Official certificate instructions</a>{" · "}<a href="https://search.notary.sos.in.gov/">Official commission search</a></p>
   <p>Keep your certificate and application records for your own reference. The FAQ does not give a separate first-applicant record-retention period or promise an immediate download after passing. Check your active commission and effective dates before performing acts.</p>
  </section>
  {resources ? <section className="card"><h2>Official reference library</h2><ul>
   <li><a href={portal}>INBiz notary entry</a> — requirements and state-system links.</li>
   <li><a href={faq}>New-system FAQ, May 4, 2026</a> — the workflow and exam specification used here.</li>
   <li><a href="https://inbiz.in.gov/Assets/NotaryGuide.pdf">Indiana Notary Public Guide</a> — official guide endpoint; access may require opening INBiz. The indexed guide is revised May 20, 2024.</li>
   <li><a href="https://iga.in.gov/laws/2026/ic/titles/33#33-42">Indiana Code, Article 33-42</a>{" · "}<a href="https://iar.iga.in.gov/code/2026/75/7">75 IAC 7</a> — current law and administrative rules; JavaScript required.</li>
   <li><a href="https://www.in.gov/sboa/files/Grosser_SOS-Business-Services-Division_Notary.pdf">SOS notary presentation</a> — supporting traditional-notary instruction.</li>
  </ul><h3>Older instructions and scope</h3><p>Some older official material directs applicants to an INBiz dashboard, uses a 30-day criminal-report window, or describes an older certificate workflow. This guide uses the May 2026 system-specific FAQ for those steps and its six-month report window. The 2024 fee figure is labeled with its publication date. We could not independently read the current IGA law text or the guide download during this check, so no proposed 2026 bill is presented as enacted law.</p><p>For application-specific instructions or conflicting portal messages, contact <a href="mailto:INBiz@sos.in.gov">INBiz@sos.in.gov</a>.</p></section> : null}
  {children}
  <div className="row"><Link className="btn btn-primary" href={`${inPaths.practice}?mode=quick`}>Start Free Practice</Link><Link className="btn btn-ghost" href={resources ? inPaths.become : inPaths.resources}>{resources ? "Application Checklist" : "Official Resources"}</Link></div>
 </main>;
}
