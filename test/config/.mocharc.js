'use strict';

module.exports = {
  bail: false,
  fullTrace: true,
  grep: '',
  ignoreLeaks: false,
  reporter: 'spec',
  spec: 'test/tests/*.js',
  retries: 0,
  slow: 100,
  timeout: 2000,
  ui: 'bdd',
  color: true,
  file: [
    'test/pretest.js'
  ]
};
