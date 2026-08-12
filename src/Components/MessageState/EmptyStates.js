import * as React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  Button,
  EmptyStateActions,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';

import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import WrenchIcon from '@patternfly/react-icons/dist/js/icons/wrench-icon';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';

import MessageState from './MessageState';
import messages from '../../Messages';
import { BASE_PATH } from '../../Routes';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

const NoAffectedClusters = () => {
  const intl = useIntl();
  return (
    <MessageState
      title={intl.formatMessage(messages.noAffectedClustersTitle)}
      text={intl.formatMessage(messages.noAffectedClustersBody)}
      icon={CheckCircleIcon}
      status="success"
    />
  );
};

const NoMatchingClusters = () => {
  const intl = useIntl();
  return (
    <MessageState
      title={intl.formatMessage(messages.noMatchingClustersTitle)}
      text={intl.formatMessage(messages.noMatchingClustersBody)}
    />
  );
};
// used in the recs list table: no filters match
const NoMatchingRecs = () => {
  const intl = useIntl();
  return (
    <MessageState
      title={intl.formatMessage(messages.noMatchingRecsTitle)}
      text={intl.formatMessage(messages.noMatchingRecsBody)}
    />
  );
};

// used in Routes.js to create custom message instead of <InvalidObject>

const ComingSoon = () => {
  const intl = useIntl();
  return (
    <EmptyState
      headingLevel="h2"
      icon={InProgressIcon}
      titleText={<>{intl.formatMessage(messages.comingSoonTitle)}</>}
      variant="sm"
      id="coming-soon-message"
    >
      <EmptyStateBody>
        {intl.formatMessage(messages.comingSoonBody)}
      </EmptyStateBody>
      <EmptyStateFooter>
        <Link to={`${BASE_PATH}/recommendations`}>
          <Button variant="primary">Recommendations</Button>
        </Link>
      </EmptyStateFooter>
    </EmptyState>
  );
};

const NoRecsForClusters = () => {
  const lightspeedFeatureFlag = useFeatureFlag('platform.lightspeed-rebrand');
  const intl = useIntl();
  return (
    <EmptyState
      headingLevel="h2"
      icon={PlusCircleIcon}
      titleText={<>{intl.formatMessage(messages.noRecsForClusterListTitle)}</>}
      variant="sm"
    >
      <EmptyStateBody>
        {intl.formatMessage(
          lightspeedFeatureFlag
            ? messages.noRecsForClusterListBodyLightspeed
            : messages.noRecsForClusterListBody,
        )}
      </EmptyStateBody>
      <EmptyStateFooter>
        <Button
          component="a"
          variant="primary"
          href="https://console.redhat.com/openshift/create"
        >
          Create cluster
        </Button>
        <EmptyStateActions>
          <Button
            component="a"
            variant="link"
            href="https://console.redhat.com/openshift/register"
          >
            Register cluster
          </Button>
          <Button
            component="a"
            variant="link"
            href="https://console.redhat.com/openshift/assisted-installer/clusters"
          >
            Assisted Installer clusters
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

const NoInsightsResults = () => {
  const lightspeedFeatureFlag = useFeatureFlag('platform.lightspeed-rebrand');
  const intl = useIntl();
  return (
    <MessageState
      title={intl.formatMessage(messages.noRecsFoundError)}
      text={
        <React.Fragment>
          {intl.formatMessage(
            lightspeedFeatureFlag
              ? messages.noRecsFoundErrorDescLightspeed
              : messages.noRecsFoundErrorDesc,
          )}
          <a href="https://docs.openshift.com/container-platform/latest/support/getting-support.html">
            {' '}
            OpenShift documentation.
          </a>
        </React.Fragment>
      }
      icon={InfoCircleIcon}
      status="info"
      variant="large"
    />
  );
};

const NoRecsError = () => {
  const intl = useIntl();
  return (
    <MessageState
      title={intl.formatMessage(messages.noRecsError)}
      text={intl.formatMessage(messages.noRecsErrorDesc)}
      icon={ExclamationCircleIcon}
      status="danger"
    />
  );
};

const NoRecsAffecting = () => {
  const intl = useIntl();
  return (
    <MessageState
      icon={CheckCircleIcon}
      status="success"
      title={intl.formatMessage(messages.noRecommendations)}
      text={intl.formatMessage(messages.noRecommendationsDesc)}
    />
  );
};

const NoUpdateRisks = () => {
  const intl = useIntl();
  return (
    <MessageState
      icon={CheckCircleIcon}
      status="success"
      title={intl.formatMessage(messages.noUpdateRisksFound)}
      text={intl.formatMessage(messages.noUpdateRisksFoundDesc)}
    />
  );
};

const UpdateRisksNotAvailable = () => {
  const intl = useIntl();
  return (
    <MessageState
      icon={ExclamationTriangleIcon}
      title={intl.formatMessage(messages.updateRisksNotAvailable)}
      text={intl.formatMessage(messages.updateRisksNotAvailableDesc)}
    />
  );
};

// used in the workloads objects
const NoMatchingWorkloadsObjects = () => {
  return (
    <MessageState
      title={'No matching workloads found'}
      text={'To continue, edit your filter settings and search again.'}
    />
  );
};

const NoWorkloadsRecsAvailable = () => {
  return (
    <MessageState
      icon={ExclamationCircleIcon}
      status="danger"
      title="Unable to connect"
      text={
        <>
          <p>Check your connection and reload the page.</p>
          <Button
            variant="primary"
            className="pf-v6-u-mt-xl"
            onClick={() => history.back()}
          >
            Return to previous page
          </Button>
          <br />
        </>
      }
    />
  );
};

const NoRecsForWorkloadsDetails = () => {
  return (
    <MessageState
      icon={CheckCircleIcon}
      status="success"
      title="No workload recommendations"
      text={
        <>
          <p>There are no recommendations for this workload.</p>
          <Button
            variant="primary"
            className="pf-v6-u-mt-xl"
            onClick={() => history.back()}
          >
            Return to previous page
          </Button>
        </>
      }
    />
  );
};

const NoMatchingWorkloads = () => {
  return (
    <MessageState
      title={'No matching workloads found'}
      text={'To continue, edit your filter settings and search again.'}
    />
  );
};

const NoMatchingRecsForWorkloads = () => {
  return (
    <MessageState
      title={'No matching recommendations found'}
      text={'To continue, edit your filter settings and search again.'}
    />
  );
};

const NoDVOInstalledOrDataCollected = () => {
  return (
    <MessageState
      icon={WrenchIcon}
      title="Configure your workloads"
      text={
        <>
          <p>
            By enabling the advisor workloads feature, you can view
            namespace-level recommendations. To get started, install and
            configure the Deployment Validation Operator.
          </p>
          <br />
          <a
            className="pf-v6-u-display-inline-block pf-v6-u-mt-xl"
            href="https://catalog.redhat.com/search?gs&q=dvo"
          >
            Install Deployment Validation Operator
          </a>
        </>
      }
    />
  );
};

export {
  ErrorState,
  NoAffectedClusters,
  NoMatchingClusters,
  NoMatchingRecs,
  ComingSoon,
  NoRecsForClusters,
  NoInsightsResults,
  NoRecsError,
  NoRecsAffecting,
  NoUpdateRisks,
  UpdateRisksNotAvailable,
  NoMatchingWorkloadsObjects,
  NoWorkloadsRecsAvailable,
  NoRecsForWorkloadsDetails,
  NoMatchingWorkloads,
  NoMatchingRecsForWorkloads,
  NoDVOInstalledOrDataCollected,
};
