import { paths } from "@/lib/paths";
import { mailSiteUrl } from "@/lib/email";

export function prefsUrl() {
  return `${mailSiteUrl()}${paths.account}`;
}

export function practiceUrl() {
  return `${mailSiteUrl()}${paths.practice}`;
}

export function mistakesUrl() {
  return `${mailSiteUrl()}${paths.mistakes}`;
}

function footer() {
  return `<p style="margin-top:24px;font-size:13px;color:#555">
<a href="${practiceUrl()}">Continue Practice</a> ·
<a href="${mistakesUrl()}">Review Wrong Answers</a> ·
<a href="${prefsUrl()}">Manage email preferences</a>
</p>
<p style="font-size:12px;color:#777">You can turn off Daily Reminder, Weekly Progress, or Exam Reminder on your account page. Verification and password emails are not controlled by these preferences.</p>`;
}

export function dailyEmailHtml(opts: {
  name: string | null;
  streak: number;
  accuracy: number;
  lastStudy: string;
}) {
  const who = opts.name ? `Hi ${escapeHtml(opts.name)},` : "Hi,";
  return `<p>${who}</p>
<p>A short session keeps your Arizona Notary prep streak going.</p>
<p>Current streak: <strong>${opts.streak} day${opts.streak === 1 ? "" : "s"}</strong><br>
Overall accuracy: <strong>${opts.accuracy}%</strong><br>
Last study: ${escapeHtml(opts.lastStudy)}</p>
<p><a href="${practiceUrl()}">Continue Practice</a></p>
${footer()}`;
}

export function weeklyEmailHtml(opts: {
  name: string | null;
  questions: number;
  correct: number;
  wrong: number;
  accuracy: number;
  tests: number;
  weakest: string | null;
  strongest: string | null;
  streak: number;
  readiness: number | null;
  prevAccuracy: number | null;
}) {
  const who = opts.name ? `Hi ${escapeHtml(opts.name)},` : "Hi,";
  const delta =
    opts.prevAccuracy == null
      ? ""
      : opts.accuracy === opts.prevAccuracy
        ? `<p>Your accuracy stayed at ${opts.accuracy}%.</p>`
        : `<p>Your accuracy ${opts.accuracy > opts.prevAccuracy ? "improved" : "changed"} from ${opts.prevAccuracy}% to ${opts.accuracy}%.</p>`;
  return `<p>${who}</p>
<p>You practiced <strong>${opts.questions}</strong> question${opts.questions === 1 ? "" : "s"} this week.</p>
<p>Correct: ${opts.correct} · Wrong: ${opts.wrong} · Accuracy: <strong>${opts.accuracy}%</strong></p>
<p>Practice tests completed: ${opts.tests}</p>
${opts.weakest ? `<p>Your weakest topic is ${escapeHtml(opts.weakest)}.</p>` : ""}
${opts.strongest ? `<p>Your strongest topic is ${escapeHtml(opts.strongest)}.</p>` : ""}
<p>Current streak: ${opts.streak} day${opts.streak === 1 ? "" : "s"}.</p>
${opts.readiness == null ? "" : `<p>Exam readiness score: <strong>${opts.readiness}%</strong></p>`}
${delta}
<p><a href="${mistakesUrl()}">Review Wrong Answers</a> · <a href="${practiceUrl()}">Continue Practice</a></p>
${footer()}`;
}

export function examEmailHtml(opts: { name: string | null; days: number; examDate: string }) {
  const who = opts.name ? `Hi ${escapeHtml(opts.name)},` : "Hi,";
  const when = opts.days === 1 ? "tomorrow" : `in ${opts.days} days`;
  return `<p>${who}</p>
<p>Your Arizona notary exam is ${when} (${escapeHtml(opts.examDate)}).</p>
<p>Review weak topics and take a timed practice test before exam day.</p>
<p><a href="${mistakesUrl()}">Review Wrong Answers</a> · <a href="${practiceUrl()}">Continue Practice</a></p>
${footer()}`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
