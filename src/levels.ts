export const LogLevel = Object.freeze({
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  trace: 5
} as const);

export type LogLevelType = keyof typeof LogLevel;

export type LogLevelValue = typeof LogLevel[LogLevelType];
