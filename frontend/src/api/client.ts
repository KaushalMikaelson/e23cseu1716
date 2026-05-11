import { ApiResponse } from './types';
import { Log } from './logger';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

/**
 * Generic fetch wrapper for the backend API.
 * Throws on network errors or non-success API responses.
 */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (err) {
    const msg = `Network error on ${path}: ${(err as Error).message}`;
    Log('frontend', 'error', 'api', msg);
    throw new Error(msg);
  }

  const json: ApiResponse<T> = await response.json();

  if (!json.success) {
    const msg = json.message ?? 'API request failed';
    Log('frontend', 'error', 'api', `API error on ${path}: ${msg}`);
    throw new Error(msg);
  }

  return json.data as T;
}

export default request;
