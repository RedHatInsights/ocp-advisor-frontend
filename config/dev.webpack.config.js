const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const insightsProxy = {
  https: false,
  ...(process.env.BETA && { deployment: 'beta/apps' }),
};

const webpackProxy = {
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  env: process.env.BETA ? 'ci-beta' : 'ci-stable',
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
  customProxy: [
    {
      context: ['/api'],
      target: 'https://qa.cloud.redhat.com/',
      secure: true,
      changeOrigin: true,
      autoRewrite: true,
    },
  ],
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
