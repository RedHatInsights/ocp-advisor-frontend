import { Alert } from '@patternfly/react-core';
import React from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import messages from '../../Messages';
import { useGetUpgradeRisksQuery } from '../../Services/SmartProxy';
import { strong } from '../../Utilities/Helpers';

const UpgradeRisksAlert = () => {
  const intl = useIntl();
  const { clusterId } = useParams();
  const { isError, isUninitialized, isFetching, isSuccess, data, error } =
    useGetUpgradeRisksQuery({ id: clusterId });
  const { alerts = [], operator_conditions: conditions = [] } =
    data?.upgrade_recommendation?.upgrade_risks_predictors || {};

  const hasRisks = isSuccess && (alerts.length > 0 || conditions.length > 0);
  const noRisks = isSuccess && alerts.length === 0 && conditions.length === 0;

  return isUninitialized || isFetching ? (
    <></>
  ) : hasRisks ? (
    <Alert
      variant="warning"
      isInline
      title={intl.formatMessage(messages.resolveUpgradeRisks)}
    >
      {intl.formatMessage(messages.resolveUpgradeRisksDesc, { strong })}
    </Alert>
  ) : noRisks ? (
    <Alert
      variant="success"
      isInline
      title={intl.formatMessage(messages.noKnownUpgradeRisks)}
    />
  ) : isError && error.status === 503 ? (
    <Alert
      variant="warning"
      isInline
      title={intl.formatMessage(messages.upgradeRisksNotCurrentlyAvailable)}
    />
  ) : (
    <></>
  );
};

export default UpgradeRisksAlert;
