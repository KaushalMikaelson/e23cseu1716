// Allowed stacks
export type Stack = 'backend' | 'frontend';

// Allowed log levels
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Backend-specific packages
export type BackendPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';

// Frontend-specific packages
export type FrontendPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style';

// Shared packages across both stacks
export type SharedPackage = 'auth' | 'config' | 'middleware' | 'utils';

export type PackageName = BackendPackage | FrontendPackage | SharedPackage;

// Shape of the payload posted to the log endpoint
export interface LogPayload {
  stack: Stack;
  level: Level;
  package_name: PackageName;
  message: string;
}
