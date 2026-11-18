import { MistakeActions } from "@/components/MistakeActions";

export function WrongAnswerPreview({ question }: { question: string }) {
  return (
    <div
      role="img"
      aria-label="Interface demonstration of the wrong-answer notebook with review filters and one sample Arizona commission question"
    >
      <div className="home-notebook-preview" inert aria-hidden="true">
        <p className="home-notebook-title">Wrong-answer notebook</p>
        <div className="tool-row">
          <span className="chip">All</span>
          <span className="chip on">Incorrect</span>
          <span className="chip">Saved</span>
        </div>
        <div className="home-notebook-record">
          <span className="home-notebook-topic">
            COMMISSION · SAMPLE QUESTION
          </span>
          <p>{question}</p>
          <MistakeActions
            signedIn={false}
            study={{ href: "/arizona-notary-study-cards/?topic=commission" }}
            practice={{
              href: "/arizona-notary-practice-test/?topic=commission",
            }}
            onAction={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
