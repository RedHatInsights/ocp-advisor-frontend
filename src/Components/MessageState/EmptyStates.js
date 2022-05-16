import * as React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { Stack, StackItem } from '@patternfly/react-core/dist/js/layouts/Stack';
import { Title, Button } from '@patternfly/react-core';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
} from '@patternfly/react-core/dist/js/components/EmptyState';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import { global_success_color_100 as globalSuccessColor100 } from '@patternfly/react-tokens/dist/js/global_success_color_100';
import { global_danger_color_100 as globalDangerColor100 } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import { InProgressIcon } from '@patternfly/react-icons/dist/esm/icons/in-progress-icon';

import DefaultErrorMessage from '@redhat-cloud-services/frontend-components/ErrorState/DefaultErrorMessage';

import MessageState from './MessageState';
import messages from '../../Messages';

// Analogue for ErrorState from the frontend-components without the "Go to homepage" button
// TODO: update ErrorState from the frontend-components and remove custom error here
const ErrorState = () => {
  const intl = useIntl();
  return (
    <EmptyState>
      <EmptyStateIcon
        icon={ExclamationCircleIcon}
        color={globalDangerColor100.value}
      />
      <Title headingLevel="h4" size="lg">
        {intl.formatMessage(messages.errorStateTitle)}
      </Title>
      <EmptyStateBody>
        <Stack>
          <StackItem>{intl.formatMessage(messages.errorStateBody)}</StackItem>
          <StackItem>
            <DefaultErrorMessage />
          </StackItem>
        </Stack>
      </EmptyStateBody>
    </EmptyState>
  );
};

const NoAffectedClusters = () => {
  const intl = useIntl();
  return (
    <EmptyState>
      <EmptyStateIcon
        icon={CheckCircleIcon}
        color={globalSuccessColor100.value}
      />
      <Title headingLevel="h4" size="lg">
        {intl.formatMessage(messages.noAffectedClustersTitle)}
      </Title>
      <EmptyStateBody>
        {intl.formatMessage(messages.noAffectedClustersBody)}
      </EmptyStateBody>
    </EmptyState>
  );
};

const NoMatchingClusters = () => {
  const intl = useIntl();
  return (
    <EmptyState>
      <Title headingLevel="h5" size="lg">
        {intl.formatMessage(messages.noMatchingClustersTitle)}
      </Title>
      <EmptyStateBody>
        {intl.formatMessage(messages.noMatchingClustersBody)}
      </EmptyStateBody>
    </EmptyState>
  );
};
// used in the recs list table: no filters match
const NoMatchingRecs = () => {
  const intl = useIntl();
  return (
    <MessageState
      title={intl.formatMessage(messages.noMatchingRecsTitle)}
      text={intl.formatMessage(messages.noMatchingRecsBody)}
      icon={CheckCircleIcon}
      iconStyle={{ color: globalSuccessColor100.value }}
    />
  );
};

// used in Routes.js to create custom message instead of <InvalidObject>

const ComingSoon = () => {
  const intl = useIntl();
  return (
    <EmptyState variant="small" id="coming-soon-message">
      <EmptyStateIcon icon={InProgressIcon} color="#151515" />
      <Title headingLevel="h2" size="2xl">
        {intl.formatMessage(messages.comingSoonTitle)}
      </Title>
      <EmptyStateBody>
        {intl.formatMessage(messages.comingSoonBody)}
      </EmptyStateBody>
      <Link to="/recommendations">
        <Button variant="primary">Recommendations</Button>
      </Link>
    </EmptyState>
  );
};

const NoRecsForClusters = () => {
  const intl = useIntl();
  return (
    <EmptyState variant="small">
      <EmptyStateIcon icon={PlusCircleIcon} />
      <Title headingLevel="h2" size="2xl">
        {intl.formatMessage(messages.noRecsForClusterListTitle)}
      </Title>
      <EmptyStateBody>
        {intl.formatMessage(messages.noRecsForClusterListBody)}
      </EmptyStateBody>
      <Button
        component="a"
        variant="primary"
        href="https://console.redhat.com/openshift/create"
      >
        Create cluster
      </Button>
      <EmptyStateSecondaryActions>
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
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

export {
  ErrorState,
  NoAffectedClusters,
  NoMatchingClusters,
  NoMatchingRecs,
  ComingSoon,
  NoRecsForClusters,
};
