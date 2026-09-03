"use client";

import { useEffect, useState } from "react";

export function AccountStatusBanner() {
  const [deleted, setDeleted] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDeleted(params.get("accountDeleted") === "1");
  }, []);
  if (!deleted) return null;
  return (
    <p className="notice" role="status">
      Your account has been deleted.
    </p>
  );
}
