var kaukau = require("kaukau");

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

  it('should be done', function(){
    Logger.log('we should be done here');
  });
});
