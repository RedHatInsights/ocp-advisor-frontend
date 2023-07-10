import { Alert } from '@patternfly/react-core';
import React from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import messages from '../../Messages';
import { useGetUpdateRisksQuery } from '../../Services/SmartProxy';
import { strong } from '../../Utilities/Helpers';

const UpdateRisksAlert = () => {
  const intl = useIntl();
  const { clusterId } = useParams();
  const { isError, isUninitialized, isFetching, isSuccess, data, error } =
    useGetUpdateRisksQuery({ clusterId });
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
      title={intl.formatMessage(messages.resolveUpdateRisks)}
      ouiaId="update-risks-alert"
    >
      {intl.formatMessage(messages.resolveUpdateRisksDesc, { strong })}
    </Alert>
  ) : noRisks ? (
    <Alert
      variant="success"
      isInline
      title={intl.formatMessage(messages.noKnownUpdateRisks)}
      ouiaId="update-risks-alert"
    />
  ) : isError && error.status === 404 ? (
    <Alert
      variant="warning"
      isInline
      title={intl.formatMessage(messages.updateRisksNotCurrentlyAvailable)}
      ouiaId="update-risks-alert"
    >
      {intl.formatMessage(messages.updateRisksNotAvailableDesc)}
    </Alert>
  ) : (
    <></>
  );
};

export default UpdateRisksAlert;
