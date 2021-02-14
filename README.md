# @novice1/logger

A JavaScript logging utility that prefixes logs and may color them if stdout/stderr is a TTY. Works in Node.js.

## Installation

```bash
$ npm install @novice1/logger
```

## Usage

Once imported use the function as it is or use its methods to log.

Example:

```js
var logger = require('@novice1/logger');

// white
logger('simple log'); 
logger.log('simple log');

// blue
logger.info('info log');

// magenta background
logger.debug('debug log');

// yellow
logger.warn('yellow log');

// red
logger.error('error log');
```

You can also chose your own colors for the logs using the methods `print` and `println`. Available colors can be found in the property `colors`.

Example:

```js
var logger = require('@novice1/logger');

// green
logger.print(logger.colors.FG_GREEN, 'green', 'message');

// blue background
logger.println(logger.colors.BG_BLUE, 'blue background', 'message');
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

- **log**: (...args: any[]) => void
- **info**: (...args: any[]) => void
- **debug**: (...args: any[]) => void
- **warn**: (...args: any[]) => void
- **error**: (...args: any[]) => void
- **print**: (colorCode: int, ...args: any[]) => void
- **println**: (colorCode: int, ...args: any[]) => void

## Using with debug

It can be used with the package [`debug`](https://www.npmjs.com/package/debug). All you have to do call the method `debugger` sending a `namespace` as parameter. That will return a function with the above [methods](#Methods) available except for `print` and `println`.

Example:

```js
var logger = require('@novice1/logger').debugger('app:log');
logger('simple log'); 
logger.log('simple log');
logger.info('info log');
logger.debug('debug log');
logger.warn('yellow log');
logger.error('error log');
```

You can also extend debugger

```js
var logger = require('@novice1/logger').debugger('auth');

// extend namespace
const logSign = logger.extend('sign');
const logLogin = logger.extend('login');

logger('hello'); // auth log : hello
logSign('hello'); //auth:sign log : hello
logLogin('hello'); //auth:login log : hello
```

## Formatters

[printf-style](https://en.wikipedia.org/wiki/Printf_format_string) formatting can be used when [using with debug](#Using%20with%20debug).

Officially supported formatters:

| Formatter | Representation |
|-----------|----------------|
| `%O`      | Pretty-print an Object on multiple lines. |
| `%o`      | Pretty-print an Object all on a single line. |
| `%s`      | String. |
| `%d`      | Number (both integer and float). |
| `%j`      | JSON. Replaced with the string '[Circular]' if the argument contains circular references. |
| `%%`      | Single percent sign ('%'). This does not consume an argument. |

Other formatters:

| Formatter | Representation |
|-----------|----------------|
| `%p`      | Print any type as the lib would without debug package |