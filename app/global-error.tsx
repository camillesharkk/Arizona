"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: "#ffffff",
          color: "#334455",
        }}
      >
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 16px" }}>
          <p style={{ margin: 0, color: "#586b7a", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>This page could not be loaded</h1>
          <p style={{ color: "#586b7a", fontSize: 18, lineHeight: 1.5 }}>
            Your account, practice progress, and payment status were not changed.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#56758a",
              color: "#ffffff",
              border: 0,
              borderRadius: 999,
              minHeight: 44,
              padding: "12px 24px",
              font: "inherit",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
