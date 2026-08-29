import { QuestionsClient } from "@/components/QuestionsClient";
import { publishedQuestions } from "@/data/questions";
import { QuestionPageCtas } from "@/components/QuestionPageCtas";

export const metadata = {
  title: "Arizona Notary Exam Questions",
  description: "200+ style Arizona notary practice questions with explanations and official sources.",
};

export default function ExamQuestionsPage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Exam Questions</p>
      <h1>{publishedQuestions().length}+ Arizona Notary Practice Questions — Learn One Rule at a Time</h1>
      <p className="lede">
        Filter by topic or missed items. Every question stores a source id, not just a letter key.
      </p>
      <QuestionPageCtas />
      <div id="start">
        <QuestionsClient />
      </div>
      <p className="notice" style={{ marginTop: 24 }}>
        Progress is saved on this device. Create a free account to keep the cloud notebook.
      </p>
    </main>
  );
}
