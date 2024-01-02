[![Build Status](https://app.travis-ci.com/RedHatInsights/ocp-advisor-frontend.svg?branch=master)](https://app.travis-ci.com/RedHatInsights/ocp-advisor-frontend) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![GitHub release](https://img.shields.io/github/release/RedHatInsights/ocp-advisor-frontend.svg)](https://github.com/RedHatInsights/ocp-advisor-frontend/releases/latest) [![codecov](https://codecov.io/gh/RedHatInsights/ocp-advisor-frontend/branch/master/graph/badge.svg?token=XC4AD7NQFW)](https://codecov.io/gh/RedHatInsights/ocp-advisor-frontend)


# OCP Advisor Frontend

## Running locally

### First time setup

1. Follow this [Initial etc/hosts setup from frontend-starter-app](https://github.com/RedHatInsights/frontend-starter-app#initial-etchosts-setup)
2. Make sure you have [`Node.js`](https://nodejs.org/en/) and [`npm`](https://www.npmjs.com/) installed. Check the currently maintained versions at https://nodejs.org/en/about/releases/.
3. Make sure you are using [Red Hat proxy](http://hdn.corp.redhat.com/proxy.pac).

### Running a development server

1. Install dependencies with `npm install`.
2. Run development server with `npm run start:beta` (`npm run start` for the non-beta release).
3. Local version of the application is available at https://stage.foo.redhat.com:1337/preview/openshift/insights/advisor (https://stage.foo.redhat.com:1337/openshift/insights/advisor for the non-beta release).

### Running in the production environment

1. Set the `env` field in [dev.webpack.config.js](https://github.com/RedHatInsights/ocp-advisor-frontend/blob/master/config/dev.webpack.config.js) to `process.env.BETA ? 'prod-beta' : 'prod-stable'`.
2. Run development server with `npm run start:beta` (`npm run start` for the non-beta release).
3. Local version of the application is available at https://prod.foo.redhat.com:1337/preview/openshift/insights/advisor (https://prod.foo.redhat.com:1337/openshift/insights/advisor for the non-beta release).

### Using insights-results-aggregator-mock

You can use the mocked version of Insights Results Aggregator (or Smart Proxy) API.

1. Clone https://github.com/RedHatInsights/insights-results-aggregator-mock.
2. Follow "How to build the service" and "How to start the service."
3. Once having IRA-mock server running locally, run the OCP Advisor with `npm run start:beta:mock`.

### Recommendation ID examples

- `ccx_rules_ocp.external.rules.nodes_requirements_check|NODES_MINIMUM_REQUIREMENTS_NOT_MET`
- `ccx_rules_ocp.external.rules.vsphere_upi_machine_is_in_phase|VSPHERE_UPI_MACHINE_WITH_NO_RUNNING_PHASE`
- `ccx_rules_ocp.external.rules.machineconfig_stuck_by_node_taints|NODE_HAS_TAINTS_APPLIED`
- `ccx_rules_ocp.external.rules.ocp_version_end_of_life|OCP4X_EOL_APPROACHING`
- `ccx_rules_ocp.external.rules.ocp_version_end_of_life|OCP4X_BEYOND_EOL`

## Testing

[Cypress](https://docs.cypress.io/guides/component-testing) and [Jest](https://jestjs.io/) are used as the testing frameworks.

- Run `npm run test` to execute unit-test suite (Jest + Cypress component testing).
- Run `npx cypress open --component` to open Cypress in the component tesing mode.

## Deploying

The stage environment uses and always deploys the last commit available on the master branch. The production environment deploys the commit with a hash listed in the app-interface deploy configuration file.


### Travis

- Travis uploads results to RedHatInsight's [codecov](https://codecov.io) account. To change the account, modify CODECOV_TOKEN on https://travis-ci.com/.
