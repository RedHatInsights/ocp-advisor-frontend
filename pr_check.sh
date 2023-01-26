#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
# name of app-sre "application" folder this component lives in; needs to match for quay
export COMPONENT="ocp-advisor"
# IMAGE should match the quay repo set by app.yaml in app-interface
export IMAGE="quay.io/cloudservices/ocp-advisor-frontend"
export WORKSPACE=${WORKSPACE:-$APP_ROOT} # if running in jenkins, use the build's workspace
export APP_ROOT=$(pwd)
# 16 is the default Node version. Change this to override it.
export NODE_BUILD_VERSION=16
COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master

# --------------------------------------------
# Options that must be configured by app owner
# --------------------------------------------
IQE_PLUGINS="ccx"
IQE_MARKER_EXPRESSION="ui"
IQE_FILTER_EXPRESSION="test_page"

export DEPLOY_FRONTENDS="true"
export IQE_ENV="ephemeral"
export IQE_SELENIUM="true"
export IQE_CJI_TIMEOUT="30m"

REF_ENV="insights-production"
#COMPONENTS_W_RESOURCES=""
export COMPONENT_NAME="ocp-advisor-frontend"
#COMPONENTS="ccx-data-pipeline ccx-insights-results insights-content-service insights-results-smart-proxy"  # space-separated list of components to laod"


set -exv
# source is preferred to | bash -s in this case to avoid a subshell
source <(curl -sSL $COMMON_BUILDER/src/frontend-build.sh)

# Install bonfire repo/initialize
CICD_URL=https://raw.githubusercontent.com/RedHatInsights/bonfire/master/cicd
# shellcheck source=/dev/null
curl -s $CICD_URL/bootstrap.sh > .cicd_bootstrap.sh && source .cicd_bootstrap.sh

# Run smoke tests
# shellcheck source=/dev/null
source "${CICD_ROOT}/deploy_ephemeral_env.sh"
# shellcheck source=/dev/null
#export COMPONENT_NAME="compliance"
source "${CICD_ROOT}/cji_smoke_test.sh"
# shellcheck source=/dev/null
source "${CICD_ROOT}/post_test_results.sh"