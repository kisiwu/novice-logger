export enum LogLevel {
    error = 0,
    warn = 1,
    info = 2,
    verbose = 4,
    log = 4,
    debug = 5,
    silly = 7
}

export type LogLevelType = keyof typeof LogLevel;

export type LogLevelValue = typeof LogLevel[LogLevelType];
