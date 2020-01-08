const util = require("util");
const COLORS = require("./COLORS");

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

function doLog(colorNumber, name, args, removeNextLine) {
  var stream = process.stdout;
  var processedArguments;
  try {
    processedArguments = arrayToString(args);
  } catch(e){}
  var line = `\x1b[${colorNumber || 0}m${processedArguments}\x1b[0m`;
  if (!removeNextLine) {
    line += '\n';
  }
  if (name) {
    line = `\x1b[${colorNumber || 0}m${name}\x1b[0m : ${line}`;
  }
  stream.write(line);
}

function Logger() {
  doLog(COLORS.RESET, "log", arguments);
}

Logger.log = function log() {
  doLog(COLORS.RESET, "log", arguments);
};

Logger.info = function info() {
  doLog(COLORS.FG_CYAN, "info", arguments);
};

Logger.debug = function debug() {
  doLog(COLORS.BG_MAGENTA, "debug", arguments);
};

Logger.warn = function warn() {
  doLog(COLORS.FG_YELLOW, "warn", arguments);
};

Logger.error = function error() {
  doLog(COLORS.FG_RED, "error", arguments);
};

Logger.silly = function silly() {
  doLog(COLORS.DIM, "silly", arguments);
};

Logger.print = function print() {
  doLog(arguments[0], "", Array.prototype.slice.call(arguments, 1), true);
};

Logger.println = function println() {
  doLog(arguments[0], "", Array.prototype.slice.call(arguments, 1));
};

Logger.colors = COLORS;

module.exports = Logger;
