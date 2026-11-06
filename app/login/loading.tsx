import { LoadingNote } from "@/components/QuizChrome";

export default function Loading() {
  return (
    <main className="wrap hero" aria-busy="true">
      <h1>Sign in</h1>
      <LoadingNote text="Loading sign-in…" />
    </main>
  );
}
