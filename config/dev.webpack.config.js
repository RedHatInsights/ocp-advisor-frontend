const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const insightsProxy = {
  https: false,
  ...(process.env.BETA && { deployment: 'beta/apps' }),
};

const webpackProxy = {
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  env: process.env.BETA ? 'qa-beta' : 'qa-stable', // pick chrome env ['ci-beta', 'ci-stable', 'qa-beta', 'qa-stable', 'prod-beta', 'prod-stable']
  useProxy: true,
  useCloud: true, // Until console.redhat.com is working
  appUrl: process.env.BETA
    ? ['/beta/openshift/insights/advisor']
    : ['/openshift/insights/advisor'],
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  sassPrefix: '.ocp-advisor, .ocpAdvisor',
  ...(process.env.INSIGHTS_PROXY ? insightsProxy : webpackProxy),
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
