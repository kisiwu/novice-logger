const util = require("util");
const Debug = require("debug");
const COLORS = require("./colors");
const LEVELS = require("./levels");

/* debug formatters */

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

/* format functions */

/**
 * 
 * Format to multiple lines.
 * 
 * @param {Array} arr 
 * @return {string}
 */
function arrayToStringCompact(arr) {
  return Array.from(arr)
    .map(function(x) {
      if (Array.isArray(x)) {
        return "[" + arrayToStringCompact(x) + "]";
      } else if (typeof x === "object") {
        let v = x;
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

/**
 * 
 * Format to single line.
 * 
 * @param {Array} arr 
 * @return {string}
 */
function arrayToString(arr) {
  return Array.from(arr)
    .map(function(x) {
      if (Array.isArray(x)) {
        return "[" + arrayToString(x) + "]";
      } else if (typeof x === "object") {
        /**
         * @type {string}
         */
        let v = x;
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

/**
 *  
 * @param {string} txt 
 * @param {number} [color]
 */
function colorText(txt, color) {
  return `\x1b[${color || 0}m${txt}\x1b[0m`
}

/* print functions */

/**
 * 
 * Format message and execute first argument or 'process.stdout.write'
 * 
 * @param {*} logger 
 * @param {*} colorNumber 
 * @param {*} name 
 * @param {*} args 
 * @param {*} removeNextLine 
 * @param {*} alwaysFormat 
 */
function doLog(logger, colorNumber, name, args, removeNextLine, alwaysFormat) {

  logger = logger || {};
  let write = logger.write;
  let singleLine = logger.singleLine;

  function getFormattedMessage() {
    let formattedMessage = '';
    let processedArguments = '';
    try {
      processedArguments = singleLine ? arrayToStringCompact(args) : arrayToString(args);
    } catch (e) {}
    formattedMessage = colorText(processedArguments, colorNumber);
    return formattedMessage;
  }

  function getFullFormattedMessage() {
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
    process.stdout.write(getFullFormattedMessage() + `${!removeNextLine ? '\n' : ''}`);
  }
}

function log() {
  if (this._level >= LEVELS.verbose) {
    doLog(this, COLORS.FG_DEFAULT, "log", arguments, this.write, this.alwaysFormat);
  }
}

function info() {
  if (this._level >= LEVELS.info) {
    doLog(this, COLORS.FG_CYAN, "info", arguments, this.write, this.alwaysFormat);
  }
}

function debug() {
  if (this._level >= LEVELS.debug) {
    doLog(this, COLORS.BG_MAGENTA, "debug", arguments, this.write, this.alwaysFormat);
  }
};

function warn() {
  if (this._level >= LEVELS.warn) {
    doLog(this, COLORS.FG_YELLOW, "warn", arguments, this.write, this.alwaysFormat);
  }
};

function error() {
  doLog(this, COLORS.FG_RED, "error", arguments, this.write, this.alwaysFormat);
};

function silly() {
  if (this._level >= LEVELS.silly) {
    doLog(this, COLORS.DIM, "silly", arguments, this.write, this.alwaysFormat);
  }
};

function print() {
  if (this._level >= LEVELS.silly) {
    doLog(this, arguments[0], "", Array.prototype.slice.call(arguments, 1), true, this.alwaysFormat);
  }
};

function println() {
  if (this._level >= LEVELS.silly) {
    doLog(this, arguments[0], "", Array.prototype.slice.call(arguments, 1), this.write, this.alwaysFormat);
  }
};

function customLevelPrint() {
  doLog(this, arguments[0], arguments[1], Array.prototype.slice.call(arguments, 2), this.write, this.alwaysFormat);
};

/* decoration functions */

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

/**
 * 
 * @param {Debug.Debugger} dbg 
 */
function decorateDebugger(dbg) {
  let customLogger = Logger.createLogger({
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
  customLogger.alwaysFormat = false;
  return customLogger;
}


function Logger() {
  if (this._level >= LEVELS.verbose) {
    doLog(this.write, COLORS.FG_DEFAULT, "log", arguments, this.write, this.alwaysFormat);
  }
}

// cannot overwrite "write" from default logger
Object.defineProperty(Logger, 'write', {
  value: undefined,
  configurable: false,
  enumerable: false,
  writable: false
});
initLoggerLevel(Logger);

Logger.colors = COLORS;
Logger.levels = LEVELS;

Logger.error = error;
Logger.warn = warn;
Logger.info = info;
Logger.debug = debug;
Logger.log = log;
Logger.verbose = log;
Logger.silly = silly;
Logger.print = print;
Logger.println = println;

const DEFAULT_OPTS = {write: null, extend: null, levels: {}};
Logger.createLogger = function(opts = DEFAULT_OPTS) {
  if (!opts) {
    opts = DEFAULT_OPTS
  }

  let levels = opts.levels || {};

  let extend = typeof opts.extend === 'function' ? opts.extend : null;

  let CustomLogger = function() {
    CustomLogger.log.apply(CustomLogger, Array.prototype.slice.call(arguments));
  };

  CustomLogger.write = typeof opts.write === 'function' ? opts.write : null;
  CustomLogger.alwaysFormat = true;
  CustomLogger.singleLine = false;

  CustomLogger.error = error;
  CustomLogger.warn = warn;
  CustomLogger.info = info;
  CustomLogger.log = log;
  CustomLogger.verbose = log;
  CustomLogger.debug = debug;
  CustomLogger.silly = silly;

  CustomLogger.custom = function(name) {
    let args = Array.prototype.slice.call(arguments);
    if(levels[name]) {
      // custom level
      let lvl = typeof levels[name].level === 'number' ? levels[name].level : LEVELS.silly;
      if (this._level >= lvl) {
        args.unshift(levels[name].color || COLORS.RESET);
        customLevelPrint.apply(CustomLogger, args);
      }
    } else if(typeof CustomLogger[name] === 'function') {
      // default level
      CustomLogger[name].apply(CustomLogger, args.slice(1));
    } else {
      // default log
      CustomLogger.apply(CustomLogger, args);
    }
  }

  CustomLogger.extend = function() {
    let args = Array.prototype.slice.call(arguments);
    let result;
    if (extend) {
      result = extend({ args });
    } else {
      result = Logger.createLogger(opts);
    }
    return result;
  }

  initLoggerLevel(CustomLogger);

  return CustomLogger;
}

Logger.debugger = function(namespace) {
  return decorateDebugger(Debug(namespace));
}

Logger.Debug = Debug;

module.exports = Logger;
