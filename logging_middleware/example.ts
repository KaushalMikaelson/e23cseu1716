/**
 * Example usage of the logging_middleware package.
 * Run with: LOG_BEARER_TOKEN=<token> npx ts-node example.ts
 */
import { Log } from './src';

async function main() {
  // Backend example
  await Log('backend', 'info', 'service', 'Notification service started');
  await Log('backend', 'error', 'controller', 'Failed to parse request body');

  // Frontend example
  await Log('frontend', 'debug', 'hook', 'useNotifications mounted');
  await Log('frontend', 'warn', 'page', 'Dashboard rendered with empty state');
}

main();
