export async function browserRequest(page, url, options = {}) {
  const result = await page.evaluate(async ({ url, options }) => {
    const response = await fetch(url, { method: options.data ? 'POST' : 'GET',
      headers: options.data ? { 'Content-Type': 'application/json' } : undefined,
      body: options.data ? JSON.stringify(options.data) : undefined, cache: 'no-store', signal: AbortSignal.timeout(90000) });
    return { status: response.status, text: await response.text() };
  }, { url, options });
  return { status: () => result.status, text: async () => result.text, json: async () => JSON.parse(result.text) };
}
