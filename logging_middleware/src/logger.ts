import { Stack, Level, PackageName, LogPayload } from './types';
import { postJson } from './http';
import config from './config';

const VALID_STACKS: Stack[] = ['backend', 'frontend'];
const VALID_LEVELS: Level[] = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_PACKAGES: PackageName[] = [
  // backend
  'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
  // frontend
  'api', 'component', 'hook', 'page', 'state', 'style',
  // shared
  'auth', 'config', 'middleware', 'utils',
];

function validate(stack: Stack, level: Level, packageName: PackageName): void {
  if (!VALID_STACKS.includes(stack)) {
    throw new Error(`Invalid stack "${stack}". Allowed: ${VALID_STACKS.join(', ')}`);
  }
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid level "${level}". Allowed: ${VALID_LEVELS.join(', ')}`);
  }
  if (!VALID_PACKAGES.includes(packageName)) {
    throw new Error(`Invalid packageName "${packageName}". Allowed: ${VALID_PACKAGES.join(', ')}`);
  }
  if (!config.bearerToken) {
    throw new Error('LOG_BEARER_TOKEN environment variable is missing');
  }
}

/**
 * Log(stack, level, packageName, message)
 *
 * Ships a structured log entry to the evaluation log service.
 * Validation errors are thrown synchronously.
 * Network failures are caught silently — logging must never crash the app.
 */
export async function Log(
  stack: Stack,
  level: Level,
  packageName: PackageName,
  message: string,
): Promise<void> {
  validate(stack, level, packageName);

  const payload: LogPayload = {
    stack,
    level,
    package: packageName,
    message: message.slice(0, 48),
  };

  try {
    await postJson(config.logEndpoint, payload);
  } catch (err) {
    // Intentional: a broken log endpoint must not affect application flow
    process.stderr.write(`[logger] Failed to ship log: ${(err as Error).message}\n`);
  }
}
