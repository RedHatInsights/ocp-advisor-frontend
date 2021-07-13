const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const insightsProxy = {
  https: false,
  ...(process.env.BETA && { deployment: 'beta/apps' }),
};

const webpackProxy = {
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  useProxy: true,
  useCloud: true,
  appUrl: process.env.BETA
    ? ['/beta/openshift/insights/advisor']
    : ['/openshift/insights/advisor'],
};

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  ...(process.env.PROXY ? webpackProxy : insightsProxy),
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
