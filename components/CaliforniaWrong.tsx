"use client";

import { useEffect, useState } from "react";
import { publishedCaQuestions } from "@/data/ca-questions";
import { caPaths } from "@/lib/ca-site";
import { loadProgress } from "@/lib/storage";

export function CaliforniaWrong() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => setIds(loadProgress("CA").wrongIds), []);
  const questions = publishedCaQuestions().filter((question) => ids.includes(question.question_id));
  return (
    <div className="card">
      {questions.length ? (
        <ul>
          {questions.map((question) => (
            <li key={question.question_id}>{question.question_text}</li>
          ))}
        </ul>
      ) : (
        <p>No missed California questions are saved in this browser.</p>
      )}
      <a className="btn btn-primary" href={`${caPaths.practice}?mode=weak`}>Practice missed questions</a>
    </div>
  );
}
