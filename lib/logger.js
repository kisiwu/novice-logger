const util = require("util");
const Debug = require("debug");
const COLORS = require("./colors");
const LEVELS = require("./levels");

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

function arrayToStringCompact(arr) {
  return Array.from(arr)
    .map(function(x) {
      if (Array.isArray(x)) {
        return "[" + arrayToStringCompact(x) + "]";
      } else if (typeof x === "object") {
        var v = x;
        try {
          v = util.inspect(x, {
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

function arrayToString(arr) {
  return Array.from(arr)
    .map(function(x) {
      if (Array.isArray(x)) {
        return "[" + arrayToString(x) + "]";
      } else if (typeof x === "object") {
        var v = x;
        try {
          v = util.inspect(x, {
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

function doLog(write, colorNumber, name, args, removeNextLine, alwaysFormat) {

  function colorText(txt) {
    return `\x1b[${colorNumber || 0}m${txt}\x1b[0m`
  }

  function prefixText() {
    return `\x1b[${colorNumber || 0}m${name}\x1b[0m`;
  }

  function getFormattedMessage() {
    let formattedMessage = '';
    let processedArguments = '';
    try {
      processedArguments = arrayToString(args);
    } catch (e) {}
    formattedMessage = colorText(processedArguments);
    if (!removeNextLine) {
      formattedMessage += '\n';
    }
    return formattedMessage;
  }

  function getFullFormattedMessage() {
    let formattedMessage = getFormattedMessage();
    if (name) {
      formattedMessage = `${prefixText()} : ${formattedMessage}`;
    }
    return formattedMessage;
  }
  
  if (write) {
    write({
      args: Array.from(args),
      level: name || '',
      message: alwaysFormat ? getFormattedMessage() : '',
      prefixText: name ? prefixText() : ''
    });
  } else {
    process.stdout.write(getFullFormattedMessage());
  }
}

function log() {
  if (this._level >= LEVELS.verbose) {
    doLog(this.write, COLORS.RESET, "log", arguments, this.write, this.alwaysFormat);
  }
}

function info() {
  if (this._level >= LEVELS.info) {
    doLog(this.write, COLORS.FG_CYAN, "info", arguments, this.write, this.alwaysFormat);
  }
}

function debug() {
  if (this._level >= LEVELS.debug) {
    doLog(this.write, COLORS.BG_MAGENTA, "debug", arguments, this.write, this.alwaysFormat);
  }
};

function warn() {
  if (this._level >= LEVELS.warn) {
    doLog(this.write, COLORS.FG_YELLOW, "warn", arguments, this.write, this.alwaysFormat);
  }
};

function error() {
  doLog(this.write, COLORS.FG_RED, "error", arguments, this.write, this.alwaysFormat);
};

function silly() {
  if (this._level >= LEVELS.silly) {
    doLog(this.write, COLORS.DIM, "silly", arguments, this.write, this.alwaysFormat);
  }
};

function print() {
  if (this._level >= LEVELS.silly) {
    doLog(this.write, arguments[0], "", Array.prototype.slice.call(arguments, 1), true, this.alwaysFormat);
  }
};

function println() {
  if (this._level >= LEVELS.silly) {
    doLog(this.write, arguments[0], "", Array.prototype.slice.call(arguments, 1), this.write, this.alwaysFormat);
  }
};

function customLevelPrint() {
  doLog(this.write, arguments[0], arguments[1], Array.prototype.slice.call(arguments, 2), this.write, this.alwaysFormat);
};

function Logger() {
  if (this._level >= LEVELS.verbose) {
    doLog(this.write, COLORS.RESET, "log", arguments, this.write, this.alwaysFormat);
  }
}

Logger.log = log;
Logger.info = info;
Logger.debug = debug;
Logger.warn = warn;
Logger.error = error;
Logger.silly = silly;
Logger.print = print;
Logger.println = println;

// cannot overwrite "write" from default logger
Object.defineProperty(Logger, 'write', {
  value: undefined,
  configurable: false,
  enumerable: false,
  writable: false
});

Logger.colors = COLORS;

initLoggerLevel(Logger);

const DEFAULT_OPTS = {alwaysFormat: false, extend: null, levels: {}, write: null};
Logger.createLogger = function(opts = DEFAULT_OPTS) {
  if (!opts) {
    opts = DEFAULT_OPTS
  }

  let levels = opts.levels || {};

  let extend = typeof opts.extend === 'function' ? opts.extend : null;

  let DebuggerLogger = function() {
    DebuggerLogger.log.apply(DebuggerLogger, Array.prototype.slice.call(arguments));
  };

  DebuggerLogger.write = typeof opts.write === 'function' ? opts.write : null;
  DebuggerLogger.alwaysFormat = opts.alwaysFormat || false;

  DebuggerLogger.log = log;
  DebuggerLogger.info = info;
  DebuggerLogger.debug = debug;
  DebuggerLogger.warn = warn;
  DebuggerLogger.error = error;
  DebuggerLogger.silly = silly;

  DebuggerLogger.custom = function(name) {
    let args = Array.prototype.slice.call(arguments);
    if(levels[name]) {
      // custom level
      var lvl = typeof levels[name].level === 'number' ? levels[name].level : LEVELS.silly;
      if (this._level >= lvl) {
        args.unshift(levels[name].color || COLORS.RESET);
        customLevelPrint.apply(DebuggerLogger, args);
      }
    } else if(typeof DebuggerLogger[name] === 'function') {
      // default level
      DebuggerLogger[name].apply(DebuggerLogger, args.slice(1));
    } else {
      // default log
      DebuggerLogger.apply(DebuggerLogger, args);
    }
  }

  DebuggerLogger.extend = function() {
    let args = Array.prototype.slice.call(arguments);
    let result;
    if (extend) {
      result = extend({ args });
    } else {
      result = Logger.createLogger(opts);
    }
    return result;
  }

  initLoggerLevel(DebuggerLogger);

  return DebuggerLogger;
}

Logger.debugger = function(namespace) {
  return decorateDebugger(Debug(namespace));
}

/**
 * 
 * @param {Debug.Debugger} dbg 
 */
function decorateDebugger(dbg) {
  return Logger.createLogger({
    write: function writeDebugger({ level, args, prefixText }) {
      if (prefixText) {
        if (typeof args[0] === 'string') {
          args[0] = `${prefixText} : ${args[0]}`;
        } else {
          args.unshift(prefixText);
        }
      }
      return dbg.apply(dbg, args);
    },
    extend: function extendDebugger({ args }) {
       return decorateDebugger(dbg.extend.apply(dbg, args));
    }
  });
}

/**
 * 
 * @param {Logger} logger 
 */
function initLoggerLevel(logger) {
  Object.defineProperty(logger, '_level', {
    value: LEVELS.silly,
    configurable: false,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(logger, '_levelName', {
    value: 'silly',
    configurable: false,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(logger, 'level', {
    get(){
      return this._levelName || 'silly';
    },
    set(value){
      if(typeof LEVELS[value] !== 'undefined') {
        this._levelName = value;
        this._level = LEVELS[value];
      } else if(typeof value === 'number') {
        let levelName = Object.keys(LEVELS).find(k => LEVELS[k] === value);
        if (levelName) {
          this._levelName = levelName;
          this._level = value;
        }
      }
    },
    enumerable: true
  });
}

module.exports = Logger;
