/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

module.exports = function (config) {
  config.set({


    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['mocha', 'karma-typescript'],


    // list of files / patterns to load in the browser
    files: [
      {
        pattern: 'src/**/*.ts'
      },
      {
        pattern: 'test/**/*.ts'
      }
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
      'test/**/*.ts': ['karma-typescript']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress', 'karma-typescript'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: [
      'ChromeHeadless',
      'FirefoxHeadless'
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: 1,

    browserDisconnectTimeout: 100000,
    browserNoActivityTimeout: 100000,

    karmaTypescriptConfig: {
      tsconfig: 'tsconfig.json',
      bundlerOptions: {
        transforms: [
          // eslint-disable-next-line no-undef
          require('karma-typescript-es6-transform')()
        ]
      }
    },

    client: {
      mocha: {
        timeout: 70000
      }
    }
  })
}
