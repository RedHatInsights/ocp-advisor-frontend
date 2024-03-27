const { defineConfig } = require('cypress');
const webpackConfig = require('./config/cypress.webpack.config.js');
const codeCoverageTask = require('@cypress/code-coverage/task');

module.exports = defineConfig({
  viewportWidth: 1000,
  viewportHeight: 660,
  video: false,
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig,
    },
    specPattern: 'src/**/*.cy.{js,ts,jsx,tsx}',
    setupNodeEvents(on, config) {
      codeCoverageTask(on, config);
      return config;
    },
  },
  retries: {
    experimentalStrategy: 'detect-flake-and-pass-on-threshold',
    experimentalOptions: {
      maxRetries: 2,
      passesRequired: 2,
    },

    // you must also explicitly set openMode and runMode to
    // either true or false when using experimental retries
    openMode: true,
    runMode: true,
  },
});
