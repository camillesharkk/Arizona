export function SubmitStatus() {
  return (
    <div className="submit-status" role="status" aria-live="polite">
      <span className="submit-spin" aria-hidden="true" />
      <div>
        <p><strong>Checking your answers…</strong></p>
        <p>Please keep this page open while we prepare your results.</p>
      </div>
    </div>
  );
}

export async function settleSave(request: Promise<Response>, ms = 20000): Promise<"ok" | "anon" | "fail"> {
  const timer = new Promise<"fail">((resolve) => {
    const id = setTimeout(() => resolve("fail"), ms);
    request.then(() => clearTimeout(id), () => clearTimeout(id));
  });
  try {
    const res = await Promise.race([
      request.then((response): "ok" | "anon" | "fail" => (response.status === 401 ? "anon" : response.ok ? "ok" : "fail")),
      timer,
    ]);
    return res;
  } catch {
    return "fail";
  }
}
