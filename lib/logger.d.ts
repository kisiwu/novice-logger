import COLORS from './colors';
import LEVELS from './levels';

declare var novice1Logger: novice1Logger.Logger;

export default novice1Logger;

declare namespace novice1Logger {
  interface Logger {
    (...args: any[]): void;
  
    colors: COLORS;
    levels: LEVELS;
  
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
    debug(...args: any[]): void;
    log(...args: any[]): void;
    verbose(...args: any[]): void;
    silly(...args: any[]): void;
    print(...args: any[]): void;
    println(...args: any[]): void;
  
    createLogger(options?: CreateLoggerOptions): CustomLogger;
    debugger(namespace: string): Debugger;
  }
  
  interface WriteOptions {
    level?: any;
    args?: any[];
    prefixText?: any;
  }
  
  interface Debugger {
    (...args: any[]): void;
    write: (options?: WriteOptions) => any;
    alwaysFormat: boolean;
    singleLine: boolean;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    info: (...args: any[]) => void;
    log: (...args: any[]) => void;
    verbose: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    silly: (...args: any[]) => void;
    custom(name: any, ...args: any[]): void;
    extend(namespace: string, delimiter?: string): Debugger;
  }
  
  interface CreateLoggerOptions {
    write?: Function | any;
    extend?: Function | any;
    levels?: {
      [name: string]: {
        level?: number,
        color?: number
      }
    }
  }
  
  interface CustomLogger {
    (...args: any[]): void;
    write: any;
    alwaysFormat: boolean;
    singleLine: boolean;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    info: (...args: any[]) => void;
    log: (...args: any[]) => void;
    verbose: (...args: any[]) => void;
    debug: (...args: any[]) => void;
    silly: (...args: any[]) => void;
    custom(name: any, ...args: any[]): void;
    extend(...args: any[]): CustomLogger | any;
  }
}
