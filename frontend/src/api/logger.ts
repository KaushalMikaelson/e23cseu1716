/**
 * Thin browser-safe logger adapter.
 *
 * The logging_middleware package uses Node's process.env and process.stderr
 * which aren't available in the browser. This adapter replicates the same
 * Log(stack, level, package, message) signature and POSTs to the evaluation
 * service directly via fetch — no Node APIs needed.
 */

type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type PackageName = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'utils' | 'config' | 'middleware';

const LOG_ENDPOINT = 'http://4.224.186.213/evaluation-service/logs';
const TOKEN = import.meta.env.VITE_LOG_BEARER_TOKEN ?? '';

export async function Log(
  _stack: 'frontend',
  level: Level,
  packageName: PackageName,
  message: string,
): Promise<void> {
  if (!TOKEN) return; // silently skip if token not configured

  try {
    await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        stack: 'frontend',
        level,
        package_name: packageName,
        message,
      }),
    });
  } catch {
    // Logging must never crash the UI
  }
}
