const { Logger } = require('../../lib/index');
const assert = require('node:assert');

describe("Test", () => {

  let array = [
    {
      name: 'one',
      value: 1
    },
    {
      name: 'two',
      value: 2
    },
  ];

  let obj = {
    name: 'circular ref'
  };
  obj.value = obj;

  array.push(obj);

  it('should log', function(){
    Logger.log('Simple verbose message', array);
    Logger.info('Simple info message', array);
    Logger.debug('Simple debug message', array);
    Logger.warn('Simple warn message', array);
    Logger.error('Simple error message', array);
    Logger.trace('Simple trace message', array);
  });

  it('should print', function(){
    Logger.print(Logger.colors.FG_GREEN, 'green', 'message');
    Logger.print(Logger.colors.RESET, '', 'followed', 'by', '');
    Logger.println(Logger.colors.BG_BLUE, 'background blue', 'message');
  });

  it('should log using debugger', function(){
    const dbg = Logger.debugger('logger:test');
    dbg('Simple verbose message %d', 1)
    dbg.log('Simple verbose message %d', 2);
    dbg.info('Simple info message %j', array);
    dbg.debug('Simple debug message', array);
    dbg.warn('Simple warn message %o', array);
    dbg.verbose('Single line verbose message %p', array);
    dbg.error('Multiple lines error message %P', array);
    dbg.trace('Multiple lines trace message %O', array);
  });

  it('should extend debugger', function(){
    const originalDbg = Logger.debugger('logger:test');
    originalDbg.info('original');
    originalDbg.extend('extended').info('extended');
  });

  it(`custom logger`, function(){
    const customLogger = Logger.createLogger({
      levels: {
        success: {
          color: Logger.colors.FG_GREEN, // color of message
          level: Logger.levels.info // level of custom. Default: Logger.levels.trace
        }
      },
      /**
       * Overwrite the default function
       */
      write({ args, level, message, prefixText }) {
        const msg = `custom ${prefixText} - ${message}`;
        if (level === 'error') {
          console.error(msg);
        } else {
          console.log(msg);
        }
      }
    });
    
    // print objects on a single line
    customLogger.singleLine = true;
    customLogger('verbose log');
    customLogger.log('verbose log');
    customLogger.info('info log');
    customLogger.debug('debug log');
    customLogger.warn('yellow log single line', {a: 1, b: 2, c: 3});

    customLogger.singleLine = false;

    customLogger.error('error log multiple lines', {a: 1, b: 2, c: 3});
    
    customLogger.custom('success',  'everything is green');
  });

  it('should format messages', function(){
    const message = ['one', 2, {three: ['four', 5]}]
    const multi = Logger.formatMessage(message);
    const single = Logger.formatMessage(message, true);
    console.log('message:', message);
    console.log('multiple lines:', multi);
    console.log('single line:', single);

    assert.ok(multi.includes('\n'), 'multi-line output should contain newlines');
    assert.ok(!single.includes('\n'), 'single-line output should not contain newlines');
    assert.strictEqual(single, 'one 2 { three: [ \'four\', 5 ] }');
  });

  it('should be done', function(){
    Logger('we should be done here');
  });
});
