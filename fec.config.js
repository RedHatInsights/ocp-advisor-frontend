const { resolve } = require('path');
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

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
  devtool: 'hidden-source-map',
  plugins: [
    // Put the Sentry Webpack plugin after all other plugins
    ...(process.env.ENABLE_SENTRY
      ? [
          sentryWebpackPlugin({
            ...(process.env.SENTRY_AUTH_TOKEN && {
              authToken: process.env.SENTRY_AUTH_TOKEN,
            }),
            org: 'red-hat-it',
            project: 'ocp-advisor',
            moduleMetadata: ({ release }) => ({
              dsn: `https://27daee0fa0238ac7f7d5389b8ac8f825@o490301.ingest.us.sentry.io/4508683272454144`,
              org: 'red-hat-it',
              project: 'ocp-advisor',
              release,
            }),
          }),
        ]
      : []),
  ],
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
