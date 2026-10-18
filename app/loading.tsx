export default function Loading() {
  return (
    <main className="wrap hero" aria-busy="true" aria-live="polite">
      <p className="kicker">Loading</p>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line skeleton-line-short" />
    </main>
  );
}
