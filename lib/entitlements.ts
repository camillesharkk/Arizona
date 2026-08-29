import type { Question } from "@/lib/types";
import { publishedQuestions } from "@/data/questions";
import { chapters } from "@/data/study-guide";

export type Plan = "free" | "pro";

export type SessionUser = {
  id: string;
  email: string;
  plan: Plan;
  planStatus: string;
  emailVerified: boolean;
  name: string | null;
};

export function isPro(user: SessionUser | null) {
  if (!user) return false;
  if (user.plan !== "pro") return false;
  if (user.planStatus === "canceled" || user.planStatus === "expired" || user.planStatus === "refunded") {
    return false;
  }
  return true;
}

export function canAccessQuestion(user: SessionUser | null, q: Question) {
  if (q.is_free) return true;
  return isPro(user);
}

export function visibleQuestions(user: SessionUser | null) {
  const pro = isPro(user);
  return publishedQuestions().filter((q) => q.is_free || pro);
}

export function canAccessFullStudyGuide(user: SessionUser | null) {
  return isPro(user);
}

export function studyChapterLocked(user: SessionUser | null, chapterId: string) {
  if (isPro(user)) return false;
  const premium = new Set(chapters.slice(6).map((c) => c.id));
  return premium.has(chapterId);
}

export function aiDailyLimit(user: SessionUser | null) {
  if (!user) return 0;
  return isPro(user) ? 40 : 3;
}

export function canUseAdvancedAnalytics(user: SessionUser | null) {
  return isPro(user);
}

export function canUseFullMistakes(user: SessionUser | null) {
  return !!user;
}

export function freeMistakeCap() {
  return 25;
}
