import Debug from 'debug'
import { inspect } from 'util'
import { Colors } from './colors'
import { LogLevel, LogLevelValue, type LogLevelType } from './levels'

//#region Formatters

/**
 * 
 * Format to single line.
 * 
 * @param arr 
 * @return string
 */
function arrayToStringCompact(arr: Array<any>): string {
  return Array.from(arr)
    .map(function(x) {
      if (Array.isArray(x)) {
        return "[" + arrayToStringCompact(x) + "]";
      } else if (typeof x === "object") {
        let v = x;
        try {
          v = inspect(x, {
            depth: 5,
            compact: true,
            breakLength: Infinity,
            colors: false,
            getters: true,
          });
        } catch (e) {
          // debug
          Debug('@novice1/logger')(e);
        }
        return v;
      } else {
        return x;
      }
    })
    .join(" ");
}

/**
 * 
 * Format to multiple lines.
 * 
 * @param arr 
 * @return string
 */
function arrayToString(arr: Array<any>): string {
  return Array.from(arr)
    .map(function(x) {
      if (Array.isArray(x)) {
        return "[" + arrayToString(x) + "]";
      } else if (typeof x === "object") {
        let v = x;
        try {
          v = inspect(x, {
            depth: 5,
            compact: false,
            colors: false,
            getters: true,
          });
        } catch (e) {
          // debug
          Debug('@novice1/logger')(e);
        }
        return v;
      } else {
        return x;
      }
    })
    .join(" ");
}

/**
 *  
 * @param txt 
 * @param color
 */
function colorText(txt: string, color?: number) {
  return `\x1b[${color || 0}m${txt}\x1b[0m`
}

//#endregion

//#region Debugger Setup
Debug.formatters.P = (v) => {
  try {
    v = arrayToString([v]);
  } catch(e){}
  return v;
}

Debug.formatters.p = (v) => {
  try {
    v = arrayToStringCompact([v]);
  } catch(e){}
  return v;
}
//#endregion

//#region Types

type WriteArg = {
  args: any[];
  level: string;
  message: string;
  prefixText: string;
}

type WriteFunction = (arg: WriteArg) => void;

type LogFunction = (...args: any[]) => void;

type LevelControl = {
  get level(): string;
  set level(v: LogLevelType | LogLevelValue);
  setLevel(v: LogLevelType | LogLevelValue): void;
}

/** Internal state shared by the default logger and custom loggers. */
type LoggerContext = {
  _level: number;
  _levelName: string;
  write?: WriteFunction | null;
  singleLine?: boolean;
  alwaysFormat?: boolean;
}

//#endregion

//#region Levels

function initLoggerLevel(logger: object): void {
  Object.defineProperty(logger, '_level', {
    value: LogLevel.trace,
    configurable: false,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(logger, '_levelName', {
    value: 'trace',
    configurable: false,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(logger, 'level', {
    get(this: LoggerContext) {
      return this._levelName || 'trace';
    },
    set(this: LoggerContext, value: LogLevelType | LogLevelValue) {
      if (typeof value === 'string' && Object.hasOwn(LogLevel, value)) {
        this._levelName = value;
        this._level = LogLevel[value as LogLevelType];
      } else if (typeof value === 'number') {
        const levelName = (Object.keys(LogLevel) as LogLevelType[]).find(k => LogLevel[k] === value);
        if (levelName) {
          this._levelName = levelName;
          this._level = value;
        }
      }
    },
    enumerable: true
  });
  Object.defineProperty(logger, 'setLevel', {
    value: function setLevel(this: { level: LogLevelType | LogLevelValue }, value: LogLevelType | LogLevelValue) {
      this.level = value;
    },
    configurable: true,
    enumerable: true,
    writable: true
  });
}

//#endregion

//#region Printers

/**
 * 
 * Format message and execute `logger.write` or `process.stdout.write`
 * 
 * @param logger 
 * @param colorNumber 
 * @param name 
 * @param args 
 * @param removeNextLine 
 * @param alwaysFormat 
 */
function doLog(
  logger: Partial<LoggerContext> | undefined,
  colorNumber: number,
  name: string,
  args: any[],
  removeNextLine?: unknown,
  alwaysFormat?: boolean
): void {
  const write = logger?.write;
  const singleLine = logger?.singleLine;

  function getFormattedMessage(): string {
    let processedArguments = '';
    try {
      processedArguments = singleLine ? arrayToStringCompact(args) : arrayToString(args);
    } catch (e) {
      // ignore
    }
    return colorText(processedArguments, colorNumber);
  }

  function getFullFormattedMessage(): string {
    let formattedMessage = getFormattedMessage();
    if (name) {
      formattedMessage = `${colorText(name, colorNumber)} : ${formattedMessage}`;
    }
    return formattedMessage;
  }

  if (write) {
    write({
      args: Array.from(args),
      level: name || '',
      message: alwaysFormat ? getFormattedMessage() : '',
      prefixText: name ? colorText(name, colorNumber) : ''
    });
  } else {
    if (name === 'error') {
      process.stderr.write(getFullFormattedMessage() + `${!removeNextLine ? '\n' : ''}`);
    } else {
      process.stdout.write(getFullFormattedMessage() + `${!removeNextLine ? '\n' : ''}`);
    }
  }
}

function log(this: LoggerContext, ...args: any[]): void {
  if (this._level >= LogLevel.verbose) {
    doLog(this, Colors.FG_DEFAULT, 'verb', args, this.write, this.alwaysFormat);
  }
}

function info(this: LoggerContext, ...args: any[]): void {
  if (this._level >= LogLevel.info) {
    doLog(this, Colors.FG_CYAN, 'info', args, this.write, this.alwaysFormat);
  }
}

function debug(this: LoggerContext, ...args: any[]): void {
  if (this._level >= LogLevel.debug) {
    doLog(this, Colors.BG_MAGENTA, 'debug', args, this.write, this.alwaysFormat);
  }
}

function warn(this: LoggerContext, ...args: any[]): void {
  if (this._level >= LogLevel.warn) {
    doLog(this, Colors.FG_YELLOW, 'warn', args, this.write, this.alwaysFormat);
  }
}

function error(this: LoggerContext, ...args: any[]): void {
  doLog(this, Colors.FG_RED, 'error', args, this.write, this.alwaysFormat);
}

function trace(this: LoggerContext, ...args: any[]): void {
  if (this._level >= LogLevel.trace) {
    doLog(this, Colors.DIM, 'trace', args, this.write, this.alwaysFormat);
  }
}

function print(this: LoggerContext, color: number, ...args: any[]): void {
  if (this._level >= LogLevel.trace) {
    doLog(this, color, '', args, true, this.alwaysFormat);
  }
}

function println(this: LoggerContext, color: number, ...args: any[]): void {
  if (this._level >= LogLevel.trace) {
    doLog(this, color, '', args, this.write, this.alwaysFormat);
  }
}

function customLevelPrint(this: LoggerContext, color: number, name: string, ...args: any[]): void {
  doLog(this, color, name, args, this.write, this.alwaysFormat);
}

//#endregion

//#region Logger

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Logger {
  export interface WriteArg {
    args: any[];
    level: string;
    message: string;
    prefixText: string;
  }

  export interface WriteFunction {
    (arg: WriteArg): void;
  }

  export interface Debugger extends LevelControl {
    (...args: any[]): void;
    write: WriteFunction;
    alwaysFormat: boolean;
    singleLine: boolean;
    error: LogFunction;
    warn: LogFunction;
    info: LogFunction;
    log: LogFunction;
    verbose: LogFunction;
    debug: LogFunction;
    trace: LogFunction;
    custom(name: string, ...args: any[]): void;
    extend(namespace: string, delimiter?: string): Debugger;
  }

  export interface CreateLoggerOptions {
    write?: WriteFunction | null;
    extend?: ((arg: { args: any[] }) => any) | null;
    levels?: {
      [name: string]: {
        level?: number;
        color?: number;
      };
    };
    [x: string]: any;
  }

  export interface CustomLogger extends LevelControl {
    (...args: any[]): void;
    write: WriteFunction | null;
    alwaysFormat: boolean;
    singleLine: boolean;
    error: LogFunction;
    warn: LogFunction;
    info: LogFunction;
    log: LogFunction;
    verbose: LogFunction;
    debug: LogFunction;
    trace: LogFunction;
    custom(name: string, ...args: any[]): void;
    extend(...args: any[]): any;
  }

  export interface LoggerStatic extends LevelControl {
    (...args: any[]): void;
    readonly write: undefined;
    colors: typeof Colors;
    levels: typeof LogLevel;
    error: LogFunction;
    warn: LogFunction;
    info: LogFunction;
    debug: LogFunction;
    log: LogFunction;
    verbose: LogFunction;
    trace: LogFunction;
    print(color: number, ...args: any[]): void;
    println(color: number, ...args: any[]): void;
    formatMessage(message: any[], singleLine?: boolean): string;
    createLogger(options?: CreateLoggerOptions | null): CustomLogger;
    debugger(namespace: string): Debugger;
  }
}

const DEFAULT_OPTS: Logger.CreateLoggerOptions = { write: null, extend: null, levels: {} };

export const Logger: Logger.LoggerStatic = function (...args: any[]): void {
  Logger.log(...args);
} as Logger.LoggerStatic;

// cannot overwrite "write" from default logger
Object.defineProperty(Logger, 'write', {
  value: undefined,
  configurable: false,
  enumerable: false,
  writable: false
});
initLoggerLevel(Logger);

Logger.colors = Colors;
Logger.levels = LogLevel;

Logger.error = error;
Logger.warn = warn;
Logger.info = info;
Logger.debug = debug;
Logger.log = log;
Logger.verbose = log;
Logger.trace = trace;
Logger.print = print;
Logger.println = println;

Logger.formatMessage = function (messageArray: any[], singleLine?: boolean): string {
  return singleLine ? arrayToStringCompact(messageArray) : arrayToString(messageArray);
};

Logger.createLogger = function (opts: Logger.CreateLoggerOptions | null = DEFAULT_OPTS): Logger.CustomLogger {
  const options = opts || DEFAULT_OPTS;
  const levels = options.levels || {};
  const extend = typeof options.extend === 'function' ? options.extend : null;

  const customLogger = function (...args: any[]): void {
    customLogger.log(...args);
  } as Logger.CustomLogger;

  customLogger.write = typeof options.write === 'function' ? options.write : null;
  customLogger.alwaysFormat = true;
  customLogger.singleLine = false;

  customLogger.error = error;
  customLogger.warn = warn;
  customLogger.info = info;
  customLogger.log = log;
  customLogger.verbose = log;
  customLogger.debug = debug;
  customLogger.trace = trace;

  customLogger.custom = function (name: string, ...rest: any[]): void {
    const ctx = customLogger as unknown as LoggerContext;
    const level = levels[name];
    if (level) {
      // custom level
      const lvl = typeof level.level === 'number' ? level.level : LogLevel.trace;
      if (ctx._level >= lvl) {
        customLevelPrint.call(ctx, level.color || Colors.RESET, name, ...rest);
      }
    } else if (typeof (customLogger as any)[name] === 'function') {
      // default level
      (customLogger as any)[name](...rest);
    } else {
      // default log
      customLogger(name, ...rest);
    }
  };

  customLogger.extend = function (...args: any[]): any {
    return extend ? extend({ args }) : Logger.createLogger(options);
  };

  initLoggerLevel(customLogger);

  return customLogger;
};

//#endregion

//#region Debugger

function decorateDebugger(dbg: Debug.Debugger): Logger.Debugger {
  const customLogger = Logger.createLogger({
    write: function writeDebugger({ args, prefixText }) {
      if (prefixText) {
        if (typeof args[0] === 'string') {
          args[0] = `${prefixText} : ${args[0]}`;
        } else {
          args.unshift(prefixText);
        }
      }
      (dbg as unknown as LogFunction)(...args);
    },
    extend: function extendDebugger({ args }) {
      return decorateDebugger(dbg.extend(args[0], args[1]));
    }
  });
  customLogger.alwaysFormat = false;
  return customLogger as unknown as Logger.Debugger;
}

Logger.debugger = function (namespace: string): Logger.Debugger {
  return decorateDebugger(Debug(namespace));
};

//#endregion
