import config from './config';

/**
 * Thin fetch wrapper that posts a JSON payload to a URL with Bearer auth.
 * Uses a 3-second AbortController timeout so a dead log server never blocks
 * or crashes the main application.
 * Throws if the HTTP response is not successful.
 */
export async function postJson(url: string, payload: unknown): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.bearerToken}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Log endpoint returned ${response.status}: ${response.statusText} — ${body}`);
    }
  } finally {
    clearTimeout(timer);
  }
}
