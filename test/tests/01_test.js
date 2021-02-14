var Logger = require('../../index');

describe("Test", () => {

  var array = [
    {
      name: 'one',
      value: 1
    },
    {
      name: 'two',
      value: 2
    },
  ];

  var obj = {
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
    dbg.error('Multiple line error message %p', array);
    dbg.silly('Multiple line silly message %O', array);
  });

  it('should extend debugger', function(){
    const originalDbg = Logger.debugger('logger:test');
    originalDbg.info('original');
    originalDbg.extend('extended').info('extended');
  });

  it('should be done', function(){
    Logger('we should be done here');
  });
});
