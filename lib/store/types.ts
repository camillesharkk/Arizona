export type Plan = "free" | "pro";

export type UserRow = {
  id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  emailVerified: boolean;
  plan: Plan;
  planStatus: string;
  planExpiresAt: string | null;
  billingCustomerId: string | null;
  billingSubscriptionId: string | null;
  emailDaily: boolean;
  emailWeekly: boolean;
  emailExam: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  lastStudyAt: string | null;
  streakDays: number;
  lastStudyDate: string | null;
  bestScore: number | null;
  examDate: string | null;
};

export type TokenRow = {
  token: string;
  type: "verify" | "reset";
  userId: string;
  expiresAt: string;
};

export type QuestionStat = {
  userId: string;
  questionId: string;
  topic: string;
  bank: string;
  chapter: string;
  firstCorrect: boolean | null;
  lastCorrect: boolean | null;
  wrongCount: number;
  rightCount: number;
  lastSelected: string | null;
  lastCorrectOption: string | null;
  firstAt: string | null;
  lastAt: string | null;
  mastered: boolean;
  favorited: boolean;
};

export type ExamRow = {
  id: string;
  userId: string;
  mode: string;
  score: number;
  correctCount: number;
  total: number;
  at: string;
};

export type WebhookRow = {
  id: string;
  provider: string;
  at: string;
};

export type EmailType = "daily" | "weekly" | "exam";

export type Store = {
  getUserByEmail(email: string): Promise<UserRow | null>;
  getUserById(id: string): Promise<UserRow | null>;
  createUser(data: Pick<UserRow, "email" | "passwordHash" | "name">): Promise<UserRow>;
  updateUser(id: string, patch: Partial<UserRow>): Promise<UserRow>;
  putToken(row: TokenRow): Promise<void>;
  takeToken(token: string, type: TokenRow["type"]): Promise<TokenRow | null>;
  upsertStat(stat: QuestionStat): Promise<QuestionStat>;
  getStat(userId: string, questionId: string): Promise<QuestionStat | null>;
  listStats(userId: string): Promise<QuestionStat[]>;
  addExam(row: ExamRow): Promise<void>;
  listExams(userId: string): Promise<ExamRow[]>;
  aiCount(userId: string, day: string): Promise<number>;
  bumpAi(userId: string, day: string): Promise<number>;
  seenWebhook(id: string, provider: string): Promise<boolean>;
  listMailUsers(): Promise<UserRow[]>;
  claimEmailSend(userId: string, emailType: EmailType, periodKey: string): Promise<boolean>;
  finalizeEmailSend(
    userId: string,
    emailType: EmailType,
    periodKey: string,
    result: { status: "sent" | "failed"; messageId?: string | null }
  ): Promise<void>;
};
