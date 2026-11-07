import { LoadingNote } from "@/components/QuizChrome";

export default function Loading() {
  return (
    <main className="wrap hero" aria-busy="true">
      <h1>Daily Study</h1>
      <LoadingNote text="Loading your study plan…" />
    </main>
  );
}
