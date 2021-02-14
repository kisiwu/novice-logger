const util = require("util");
const Debug = require("debug");
const COLORS = require("./colors");

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
    return `\x1b[${colorNumber || 0}m${name}\x1b[0m :`;
  }

  if (!write || alwaysFormat) {
    var processedArguments;
    try {
      processedArguments = arrayToString(args);
    } catch(e){}
    var line = colorText(processedArguments);
    if (!removeNextLine) {
      line += '\n';
    }
    if (name) {
      line = `${prefixText()} ${line}`;
    }
    if (write) {
      write.apply(write, [line]);
    } else {
      process.stdout.write(line);
    }
  } else {
    var result = Array.from(args);
    if(name) {
      if (typeof result[0] === 'string') {
        result[0] = `${prefixText()} ${result[0]}`;
      } else {
        result.unshift(prefixText());
      }
    }
    write.apply(write, result);
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
  doLog(this.write, arguments[0], "", Array.prototype.slice.call(arguments, 1), this.write, this.alwaysFormat);
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

Logger.colors = COLORS;

// cannot overwrite "write" from default logger
Object.defineProperty(Logger, 'write', {
  value: undefined,
  configurable: false,
  enumerable: false,
  writable: false
});

const DEFAULT_OPTS = {alwaysFormat: false, levels: {}};
Logger.createLogger = function(writeFn, opts = DEFAULT_OPTS) {
  if (!opts) {
    opts = DEFAULT_OPTS
  }

  var levels = opts.levels || {};

  var DebuggerLogger = function() {
    DebuggerLogger.log.apply(DebuggerLogger, Array.prototype.slice.call(arguments));
  };

  DebuggerLogger.write = writeFn;
  DebuggerLogger.alwaysFormat = opts.alwaysFormat || false;

  DebuggerLogger.log = log;
  DebuggerLogger.info = info;
  DebuggerLogger.debug = debug;
  DebuggerLogger.warn = warn;
  DebuggerLogger.error = error;
  DebuggerLogger.silly = silly;

  DebuggerLogger.custom = function(name) {
    var args = Array.prototype.slice.call(arguments);
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
    var args = Array.prototype.slice.call(arguments);
    var result;
    if (writeFn && writeFn.extend) {
      result = Logger.createLogger(
        writeFn.extend.apply(writeFn, args)
      );
    } else {
      result = Logger.createLogger();
    }
    return result;
  }

  return DebuggerLogger;
}

Logger.debugger = function(namespace) {
  return Logger.createLogger(Debug(namespace));
}

module.exports = Logger;
