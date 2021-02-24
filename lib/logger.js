const util = require("util");
const Debug = require("debug");
const COLORS = require("./colors");
const LEVELS = require("./levels");

Debug.formatters.p = (v) => {
  try {
    v = arrayToString([v]);
  } catch(e){}
  return v;
}

function arrayToString(arr) {
  return Array.from(arr)
    .map(function(x) {
      if (Array.isArray(x)) {
        return "[" + arrayToString(x) + "]";
      } else if (typeof x === "object") {
        var v = x;
        try {
          v = JSON.stringify(x, null, " ");
        } catch (e) {
          v = util.inspect(x, { depth: null, compact: false }) /*JSON.stringify()/*.replace(
            "\\n",
            ""
          )*/;
          //v = v.substring(1, v.length - 1);
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
  doLog(this.write, COLORS.RESET, "log", arguments, this.write, this.alwaysFormat);
}

function info() {
  doLog(this.write, COLORS.FG_CYAN, "info", arguments, this.write, this.alwaysFormat);
}

function debug() {
  doLog(this.write, COLORS.BG_MAGENTA, "debug", arguments, this.write, this.alwaysFormat);
};

function warn() {
  doLog(this.write, COLORS.FG_YELLOW, "warn", arguments, this.write, this.alwaysFormat);
};

function error() {
  doLog(this.write, COLORS.FG_RED, "error", arguments, this.write, this.alwaysFormat);
};

function silly() {
  doLog(this.write, COLORS.DIM, "silly", arguments, this.write, this.alwaysFormat);
};

function print() {
  doLog(this.write, arguments[0], "", Array.prototype.slice.call(arguments, 1), true, this.alwaysFormat);
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
  doLog(this.write, COLORS.RESET, "log", arguments, this.write, this.alwaysFormat);
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


Object.defineProperty(Logger, '_level', {
  value: LEVELS.silly,
  configurable: false,
  enumerable: false,
  writable: true
});
Object.defineProperty(Logger, '_levelName', {
  value: 'silly',
  configurable: false,
  enumerable: false,
  writable: true
});
Object.defineProperty(Logger, 'level', {
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
      args.unshift(levels[name].color || COLORS.RESET);
      customLevelPrint.apply(DebuggerLogger, args);
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

module.exports = Logger;
