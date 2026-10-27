# @novice1/logger

A JavaScript logging utility that prefixes logs and colors them if stdout/stderr is a TTY. Works in Node.js.

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [API](#api)
  - [Methods](#methods)
  - [Colors](#colors)
  - [Levels](#levels)
- [Using with debug](#using-with-debug)
  - [Extending a debugger](#extending-a-debugger)
  - [Formatters](#formatters)
- [Custom logger](#custom-logger)

## Installation

```bash
npm install @novice1/logger
```

## Quick start

Once imported, use the function as it is or use its methods to log.

```js
const { Logger } = require('@novice1/logger');

// white
Logger('verbose log');
Logger.log('verbose log');

// blue
Logger.info('info log');

// magenta background
Logger.debug('debug log');

// yellow
Logger.warn('yellow log');

// red
Logger.error('error log');
```

## API

### Methods

| Method    | Signature                                   |
|-----------|---------------------------------------------|
| `error`   | `(...args: any[]) => void`                  |
| `warn`    | `(...args: any[]) => void`                  |
| `info`    | `(...args: any[]) => void`                  |
| `log`     | `(...args: any[]) => void`                  |
| `debug`   | `(...args: any[]) => void`                  |
| `trace`   | `(...args: any[]) => void`                  |
| `println` | `(colorCode: int, ...args: any[]) => void`  |
| `print`   | `(colorCode: int, ...args: any[]) => void`  |

### Colors

Choose your own colors with the methods `print` and `println`. Available colors are in the property `colors`.

```js
const { Logger } = require('@novice1/logger');

// green
Logger.print(Logger.colors.FG_GREEN, 'green', 'message');

// blue background
Logger.println(Logger.colors.BG_BLUE, 'blue background', 'message');
```

| Style      | Foreground   | Background   |
|------------|--------------|--------------|
| `RESET`    | `FG_BLACK`   | `BG_BLACK`   |
| `BRIGHT`   | `FG_RED`     | `BG_RED`     |
| `DIM`      | `FG_GREEN`   | `BG_GREEN`   |
| `UNDERSCORE` | `FG_YELLOW` | `BG_YELLOW` |
| `BLINK`    | `FG_BLUE`    | `BG_BLUE`    |
| `REVERSE`  | `FG_MAGENTA` | `BG_MAGENTA` |
| `HIDDEN`   | `FG_CYAN`    | `BG_CYAN`    |
|            | `FG_WHITE`   | `BG_WHITE`   |

### Levels

Methods print logs depending on the level of the logger. Levels are available in the property `levels`.

By priority:

1. **error**
2. **warn**
3. **info**
4. **verbose**
5. **debug**
6. **trace**

> **Note:** `print` and `println` are at level `trace`: they only print when the logger level is `trace`.

```js
const { Logger } = require('@novice1/logger');

// set level to info
Logger.setLevel(Logger.levels.info);

// will print
Logger.info('info log');

// will print
Logger.warn('warn log');

// will not print (print and println are at level trace)
Logger.print(Logger.colors.FG_GREEN, 'green', 'message');
```

## Using with debug

It can be used with the package [`debug`](https://www.npmjs.com/package/debug). Call the method `debugger` with a `namespace` as parameter. It returns a function with the available [methods](#methods), except for `print` and `println`.

[`debug`](https://www.npmjs.com/package/debug) properties and methods are available from the property `Debug`.

```js
// enable 'app:*'
require('@novice1/logger').Debug.enable('app:*');

const { Logger } = require('@novice1/logger');
const logger = Logger.debugger('app:log');
logger('verbose log');
logger.log('verbose log');
logger.info('info log');
logger.debug('debug log');
logger.warn('yellow log');
logger.error('error log');
```

### Extending a debugger

```js
// enable 'auth:*'
require('@novice1/logger').Debug.enable('auth:*');

const { Logger } = require('@novice1/logger');
const logger = Logger.debugger('auth');

// extend namespace
const logSign = logger.extend('sign');
const logLogin = logger.extend('login');

logger('hello');      // auth verbose : hello
logSign('hello');     // auth:sign verbose : hello
logLogin('hello');    // auth:login verbose : hello
```

### Formatters

[printf-style](https://en.wikipedia.org/wiki/Printf_format_string) formatting can be used when [using with debug](#using-with-debug).

Officially supported formatters:

| Formatter    | Representation |
|--------------|----------------|
| `%O`         | Pretty-print an Object on multiple lines. |
| `%o`         | Pretty-print an Object all on a single line. |
| `%s`         | String. |
| `%d` or `%i` | Number (both integer and float). |
| `%j`         | JSON. Replaced with the string '[Circular]' if the argument contains circular references. |
| `%%`         | Single percent sign ('%'). This does not consume an argument. |

Other formatters:

| Formatter | Representation |
|-----------|----------------|
| `%P`      | Print an Object on multiple lines. |
| `%p`      | Print an Object on a single line. |

## Custom logger

You can create a custom logger with its own levels, print function (= write) and more.

```js
const { Logger } = require('@novice1/logger');

// create custom logger
const customLogger = Logger.createLogger({
  levels: {
    success: {
      // color of message.
      color: Logger.colors.FG_GREEN,
      // level. Default: Logger.levels.trace
      level: Logger.levels.info
    }
  },
  /**
   * Overwrite the default function to print.
   * Could be used to customize message, write in a file, etc ...
   */
  write({ args, level, message, prefixText }) {
    const msg = `custom ${prefixText} - ${message} !`;
    if (level === 'error') {
      console.error(msg);
    } else {
      console.log(msg);
    }
  }
});

// print objects on a single line
customLogger.singleLine = true;

// set level
customLogger.level = Logger.levels.verbose;

// will not print because of level set
customLogger.debug('debug log');

// will print
customLogger('verbose log');
customLogger.log('verbose log');
customLogger.info('info log');
customLogger.warn('warning log');
customLogger.error('error log');

// custom level print
customLogger.custom('success', 'everything is good');
```
