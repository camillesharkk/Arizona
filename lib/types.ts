export type Difficulty = "easy" | "medium" | "hard";
export type SourceType = "Manual" | "Statute" | "SOS" | "Rule";
export type QuestionStatus = "draft" | "reviewed" | "published" | "retired";

export type TopicId =
  | "commission"
  | "identification"
  | "acknowledgments"
  | "jurats"
  | "journals"
  | "seals-fees"
  | "prohibited-acts"
  | "new-laws"
  | "copy-certification"
  | "electronic-ron";

export type Source = {
  source_id: string;
  source_type: SourceType;
  title: string;
  reference: string;
  url: string;
  last_verified_at: string;
  /** When this registry entry was last opened against the official page — not a per-question legal review. */
  last_checked_at?: string;
  document_url?: string;
  version?: string;
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
  /** Knowledge-card ids. Optional so older items keep their ids and records. */
  concept_ids?: string[];
  effective_from: string;
  effective_to: string | null;
  last_verified_at: string;
  version: number;
  is_free: boolean;
  status: QuestionStatus;
};

export type FlashcardCategory =
  | "identification"
  | "appearance"
  | "journal"
  | "conflicts"
  | "fees"
  | "dates"
  | "definitions"
  | "acts";

export type Flashcard = {
  id: string;
  category: FlashcardCategory;
  /** Workplace prompt or the question on the front. */
  front: string;
  /** Short answer used when the card has no separate rule field. */
  back: string;
  source_id: string;
  title?: string;
  rule?: string;
  boundary?: string;
  example?: string;
  mixup?: string;
  /** A memory line, kept separate from the legal rule. */
  memory?: string;
  topic?: TopicId;
  question_ids?: string[];
  kind?: "core" | "compare";
  compare?: {
    left: string;
    right: string;
    shared: string;
    rows: { label: string; a: string; b: string }[];
    mistake: string;
    twist: string;
  };
};

export type StudyChapter = {
  id: string;
  title: string;
  topic: TopicId;
  summary: string;
  sections: { heading: string; body: string }[];
  keyFacts: string[];
  source_id: string;
  example?: { heading: string; body: string };
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
  /** Only session-law items with a verified effective date appear on the hub. */
  onIndex: boolean;
};
