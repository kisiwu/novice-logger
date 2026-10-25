import Debug from 'debug'
import util from 'util'

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

//#region Printers



//#endregion

//#region Logger

//#endregion

//#region Debugger

//#endregion