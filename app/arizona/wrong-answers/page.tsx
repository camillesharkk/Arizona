import { WrongAnswersClient } from "@/components/WrongAnswersClient";

export const metadata = {
  title: "Wrong Answers",
  description: "Review missed Arizona notary practice questions and drill weak items.",
};

export default function WrongAnswersPage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Wrong Answers</p>
      <h1>Wrong-answer notebook</h1>
      <p className="lede">
        Missed items from practice tests and question drills. Practice them again, favorite a rule, or
        remove it once it sticks.
      </p>
      <WrongAnswersClient />
    </main>
  );
}
