let Logger = require('../../index');

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
    Logger.log('Simple log message', array);
    Logger.info('Simple info message', array);
    Logger.debug('Simple debug message', array);
    Logger.warn('Simple warn message', array);
    Logger.error('Simple error message', array);
    Logger.silly('Simple silly message', array);
  });

  it('should print', function(){
    Logger.print(Logger.colors.FG_GREEN, 'green', 'message');
    Logger.print(Logger.colors.RESET, '', 'followed', 'by', '');
    Logger.println(Logger.colors.BG_BLUE, 'background blue', 'message');
  });

  it('should log using debugger', function(){
    const dbg = Logger.debugger('logger:test');
    dbg('Simple log message %d', 1)
    dbg.log('Simple log message %d', 2);
    dbg.info('Simple info message %j', array);
    dbg.debug('Simple debug message', array);
    dbg.warn('Simple warn message %o', array);
    dbg.verbose('Single line verbose message %p', array);
    dbg.error('Multiple lines error message %P', array);
    dbg.silly('Multiple lines silly message %O', array);
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
          level: Logger.levels.info // level of custom. Default: Logger.levels.silly
        }
      },
      /**
       * Overwrite the default function
       */
      write({ args, level, message, prefixText }) {
        console.log(`custom ${prefixText} - ${message}`);
      }
    });
    
    // print objects on a single line
    customLogger.singleLine = true;
    customLogger('simple log');
    customLogger.log('simple log');
    customLogger.info('info log');
    customLogger.debug('debug log');
    customLogger.warn('yellow log single line', {a: 1, b: 2, c: 3});

    customLogger.singleLine = false;

    customLogger.error('error log multiple lines', {a: 1, b: 2, c: 3});
    
    customLogger.custom('success',  'everything is green');
  });

  it('should format messages', function(){
    const message = ['one', 2, {three: ['four', 5]}]
    console.log('message:', message);
    console.log('multiple lines:', Logger.formatMessage(message));
    console.log('single line:', Logger.formatMessage(message, true));
  });

  it('should be done', function(){
    Logger('we should be done here');
  });
});
