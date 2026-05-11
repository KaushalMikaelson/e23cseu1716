import config from './config';

/**
 * Thin fetch wrapper that posts a JSON payload to a URL with Bearer auth.
 * Throws if the HTTP response is not successful.
 */
export async function postJson(url: string, payload: unknown): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.bearerToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Log endpoint returned ${response.status}: ${response.statusText}`);
  }
}
