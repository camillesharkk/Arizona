import { LoadingNote } from "@/components/QuizChrome";

export default function Loading() {
  return (
    <main className="wrap hero loading-stage" aria-busy="true">
      <LoadingNote text="Loading…" />
    </main>
  );
}
