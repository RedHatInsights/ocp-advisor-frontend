const { resolve } = require('path');

module.exports = {
  appUrl: '/openshift/insights/advisor',
  debug: true,
  useProxy: process.env.PROXY === 'true',
  proxyVerbose: true,
  /**
   * Change to false after your app is registered in configuration files
   */
  sassPrefix: 'ocp-advisor, ocpAdvisor',
  /**
   * Add additional webpack plugins
   */
  plugins: [],
  ...(process.env.HOT
    ? { hotReload: process.env.HOT === 'true' }
    : { hotReload: true }),
  ...(process.env.port ? { port: parseInt(process.env.port) } : {}),
  moduleFederation: {
    exclude: ['react-router-dom'],
    shared: [
      {
        'react-router-dom': {
          singleton: true,
          import: false,
          version: '^6.3.0',
        },
      },
    ],
  },
  exposes: {
    './RootApp': resolve(__dirname, '../src/AppEntry'),
  },
};
