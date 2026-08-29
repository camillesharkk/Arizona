export type Difficulty = "easy" | "medium" | "hard";
export type SourceType = "Manual" | "Statute" | "SOS";
export type QuestionStatus = "draft" | "reviewed" | "published" | "retired";

export type TopicId =
  | "commission"
  | "identification"
  | "acknowledgments"
  | "jurats"
  | "journals"
  | "seals-fees"
  | "prohibited-acts"
  | "new-laws";

export type Source = {
  source_id: string;
  source_type: SourceType;
  title: string;
  reference: string;
  url: string;
  last_verified_at: string;
};

export type Question = {
  question_id: string;
  state: "AZ";
  topic: TopicId;
  difficulty: Difficulty;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  option_feedback: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  source_id: string;
  source_reference: string;
  effective_from: string;
  effective_to: string | null;
  last_verified_at: string;
  version: number;
  is_free: boolean;
  status: QuestionStatus;
};

export type Flashcard = {
  id: string;
  category: "fees" | "dates" | "definitions" | "acts";
  front: string;
  back: string;
  source_id: string;
};

export type StudyChapter = {
  id: string;
  title: string;
  topic: TopicId;
  summary: string;
  sections: { heading: string; body: string }[];
  keyFacts: string[];
  source_id: string;
};

export type LawChange = {
  slug: string;
  title: string;
  effective_from: string;
  status: "effective" | "upcoming";
  who_affected: string;
  before: string;
  after: string;
  impact: string;
  source_id: string;
};
