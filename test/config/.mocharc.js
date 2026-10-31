'use strict';

export default {
  bail: false,
  fullTrace: true,
  grep: '',
  ignoreLeaks: false,
  reporter: 'spec',
  spec: 'test/tests/*.test.js',
  retries: 0,
  slow: 100,
  timeout: 2500,
  ui: 'bdd',
  color: true,
  file: [
    'test/pretest.js'
  ]
};
