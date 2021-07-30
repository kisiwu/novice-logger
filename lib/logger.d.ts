import { debug as Debug } from 'debug';
import COLORS from './colors';
import LEVELS from './levels';

/*~ This declaration specifies that the function
 *~ is the exported object from the file
 */
export = Logger;

declare function Logger(...args: any[]): void;

declare namespace Logger {
    export interface WriteArg {
      args: any[],
      level: string,
      message: string,
      prefixText: string
    }

    export interface WriteFunction {
      (arg: WriteArg): void;
    }

    export interface Debugger {
      (...args: any[]): void;
      write: WriteFunction;
      alwaysFormat: boolean;
      singleLine: boolean;
      error: (...args: any[]) => void;
      warn: (...args: any[]) => void;
      info: (...args: any[]) => void;
      log: (...args: any[]) => void;
      verbose: (...args: any[]) => void;
      debug: (...args: any[]) => void;
      silly: (...args: any[]) => void;
      custom(name: string, ...args: any[]): void;
      extend(namespace: string, delimiter?: string): Debugger;
    }
    
    export interface CreateLoggerOptions {
      write?: WriteFunction;
      extend?: (arg: {args: any[]}) => any;
      levels?: {
        [name: string]: {
          level?: number,
          color?: number
        }
      };
      [x: string]: any;
    }
    
    export interface CustomLogger {
      (...args: any[]): void;
      write: WriteFunction | null;
      alwaysFormat: boolean;
      singleLine: boolean;
      error: (...args: any[]) => void;
      warn: (...args: any[]) => void;
      info: (...args: any[]) => void;
      log: (...args: any[]) => void;
      verbose: (...args: any[]) => void;
      debug: (...args: any[]) => void;
      silly: (...args: any[]) => void;
      custom(name: string, ...args: any[]): void;
      extend(...args: any[]): CustomLogger | any;
    }

    export const colors = COLORS;
    export const levels = LEVELS;
  
    export function error(...args: any[]): void;
    export function warn(...args: any[]): void;
    export function info(...args: any[]): void;
    export function debug(...args: any[]): void;
    export function log(...args: any[]): void;
    export function verbose(...args: any[]): void;
    export function silly(...args: any[]): void;
    export function print(...args: any[]): void;
    export function println(...args: any[]): void;
  
    export function createLogger(options?: CreateLoggerOptions): CustomLogger;
    function _debugger(namespace: string): Debugger;
    export { _debugger as debugger };
    export { Debug as Debug };
}