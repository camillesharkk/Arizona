"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="wrap hero">
      <p className="kicker">Something went wrong</p>
      <h1>This page could not be loaded</h1>
      <p className="lede">Your account, practice progress, and payment status were not changed. Try loading the page again.</p>
      <button className="btn btn-primary" type="button" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
