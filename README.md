# @novice1/logger

A JavaScript logging utility that prefixes logs and colors them if stdout/stderr is a TTY. Works in Node.js.

## Installation

```bash
$ npm install @novice1/logger
```

## Usage

Once imported use the function as it is or use its methods to log.

Example:

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

You can also chose your own colors for the logs using the methods `print` and `println`. Available colors can be found in the property `colors`.

Example:

```js
const { Logger } = require('@novice1/logger');

// green
Logger.print(Logger.colors.FG_GREEN, 'green', 'message');

// blue background
Logger.println(Logger.colors.BG_BLUE, 'blue background', 'message');
```

#### Available colors
- RESET
- BRIGHT
- DIM
- UNDERSCORE
- BLINK
- REVERSE
- HIDDEN
- FG_BLACK
- FG_RED
- FG_GREEN
- FG_YELLOW
- FG_BLUE
- FG_MAGENTA
- FG_CYAN
- FG_WHITE
- BG_BLACK
- BG_RED
- BG_GREEN
- BG_YELLOW
- BG_BLUE
- BG_MAGENTA
- BG_CYAN
- BG_WHITE

## Methods

- **error**: (...args: any[]) => void
- **warn**: (...args: any[]) => void
- **info**: (...args: any[]) => void
- **log**: (...args: any[]) => void
- **debug**: (...args: any[]) => void
- **trace**: (...args: any[]) => void
- **println**: (colorCode: int, ...args: any[]) => void
- **print**: (colorCode: int, ...args: any[]) => void


## Levels

Methods can print logs depending on the level of the logger.
Levels are available in the property `levels`.

By priority:
- **error**
- **warn**
- **info**
- **verbose**
- **debug**
- **trace**

Example:

```js
const { Logger } = require('@novice1/logger');

// set level to info
Logger.setLevel(Logger.levels.info);

// will print
Logger.info('info log');

// will print
Logger.warn('warn log');

// will not print
Logger.print(Logger.colors.FG_GREEN, 'green', 'message');
```

## Using with debug

It can be used with the package [`debug`](https://www.npmjs.com/package/debug). All you have to do call the method `debugger` sending a `namespace` as parameter. That will return a function with the available [methods](#Methods) except for `print` and `println`.

[`debug`](https://www.npmjs.com/package/debug) properties and methods are available from the property `Debug`. 

Example:

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

You can also extend debugger

```js
// enable 'auth:*'
require('@novice1/logger').Debug.enable('auth:*');

const { Logger } = require('@novice1/logger');
const logger = Logger.debugger('auth');

// extend namespace
const logSign = logger.extend('sign');
const logLogin = logger.extend('login');

logger('hello'); // auth verbose : hello
logSign('hello'); //auth:sign verbose : hello
logLogin('hello'); //auth:login verbose : hello
```

## Formatters

[printf-style](https://en.wikipedia.org/wiki/Printf_format_string) formatting can be used when [using with debug](#using-with-debug).

Officially supported formatters:

| Formatter | Representation |
|-----------|----------------|
| `%O`      | Pretty-print an Object on multiple lines. |
| `%o`      | Pretty-print an Object all on a single line. |
| `%s`      | String. |
| `%d` or `%i`      | Number (both integer and float). |
| `%j`      | JSON. Replaced with the string '[Circular]' if the argument contains circular references. |
| `%%`      | Single percent sign ('%'). This does not consume an argument. |

Other formatters:

| Formatter | Representation |
|-----------|----------------|
| `%P`      | Print an Object on multiple lines. |
| `%p`      | Print an Object on a single line. |



## Custom logger

You can create a custom logger, assign its own level, print function (= write) and more.

Example:
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
    console.log(`custom ${prefixText} - ${message} !`);
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
customLogger.custom('success',  'everything is good');
```
