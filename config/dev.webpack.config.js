const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  useProxy: true,
  appUrl: process.env.BETA
    ? ['/beta/openshift/insights/advisor']
    : ['/openshift/insights/advisor'],
  env: process.env.BETA ? 'stage-beta' : 'stage-stable',
  sassPrefix: '.ocp-advisor, .ocpAdvisor',
  ...(process.env.MOCK
    ? {
        routes: {
          '/api/insights-results-aggregator': {
            host: 'http://localhost:8080',
          },
        },
      }
    : {}),
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      useFileHash: false,
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry'),
      },
    }
  )
);

module.exports = {
  ...webpackConfig,
  plugins,
};
