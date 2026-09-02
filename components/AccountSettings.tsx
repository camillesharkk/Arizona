"use client";

import { useEffect, useState } from "react";

export function AccountSettings() {
  const [daily, setDaily] = useState(false);
  const [weekly, setWeekly] = useState(false);
  const [exam, setExam] = useState(false);
  const [examDate, setExamDate] = useState("");
  const [name, setName] = useState("");
  const [currentPassword, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [prefMsg, setPrefMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");

  useEffect(() => {
    fetch("/api/progress/")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setDaily(!!d.user.emailDaily);
          setWeekly(!!d.user.emailWeekly);
          setExam(!!d.user.emailExam);
          setExamDate(d.user.examDate || "");
          setName(d.user.name || "");
        }
      });
  }, []);

  async function savePrefs(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/account/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emailDaily: daily, emailWeekly: weekly, emailExam: exam, examDate }),
    });
    setPrefMsg("Preferences saved");
    setPassMsg("");
  }

  async function changePass(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/reset/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, password }) });
    setPassMsg(res.ok ? "Password updated" : "Could not update password");
    setPrefMsg("");
  }

  return (
    <div className="grid grid-2">
      <form className="card" onSubmit={savePrefs}>
        <h2>Profile</h2>
        <label className="field">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <h2>Study reminders</h2>
        <label><input type="checkbox" checked={daily} onChange={(e) => setDaily(e.target.checked)} /> Daily reminder</label>
        <label><input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} /> Weekly progress</label>
        <label><input type="checkbox" checked={exam} onChange={(e) => setExam(e.target.checked)} /> Exam reminder</label>
        <p className="notice">Turn these off anytime. Verification and password emails are not affected.</p>
        <h2>Exam date</h2>
        <label className="field">
          My exam date
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">Save</button>
        {prefMsg && <p className="notice">{prefMsg}</p>}
      </form>
      <form className="card" onSubmit={changePass}>
        <h2>Security</h2>
        <p className="lede" style={{ fontSize: "1rem" }}>Change password</p>
        <label className="field">Current<input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /></label>
        <label className="field">New<input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
        <button className="btn btn-primary" type="submit">Update password</button>
        {passMsg && <p className="notice">{passMsg}</p>}
      </form>
    </div>
  );
}
