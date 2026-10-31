'use strict';

module.exports = {
  bail: false,
  fullTrace: true,
  grep: '',
  ignoreLeaks: false,
  reporter: 'spec',
  spec: 'test/tests/*.test.cjs',
  retries: 0,
  slow: 100,
  timeout: 2500,
  ui: 'bdd',
  color: true,
  file: [
    'test/pretest.cjs'
  ]
};