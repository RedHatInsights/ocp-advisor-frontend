import {
  EmptyState,
  EmptyStateIcon,
  Flex,
  Icon,
  Label,
  Spinner,
} from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import {
  ExpandableRowContent,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUpgradeRisksQuery } from '../../Services/SmartProxy';
import { UpgradeRisksNotAvailable } from '../MessageState/EmptyStates';
import AlertsList, {
  ALERTS_SEVERITY_ICONS,
  ALERTS_SEVERITY_ORDER,
} from './AlertsList';
import ClusterOperatorsList from './ClusterOperatorsList';

const UpgradeRisksTable = () => {
  const { clusterId } = useParams();
  const { isUninitialized, isFetching, isSuccess, data } =
    useGetUpgradeRisksQuery({ id: clusterId });
  const { alerts = [], operator_conditions: conditions = [] } =
    data?.upgrade_recommendation?.upgrade_risks_predictors || {};

  const alertsDisabled = alerts.length === 0;
  const conditionsDisabled = conditions.length === 0;

  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [operatorsExpanded, setOperatorsExpanded] = useState(true);

  useEffect(() => {
    setAlertsExpanded(!alertsDisabled);
    setOperatorsExpanded(!conditionsDisabled);
  }, [data]);

  const hasRisks = isSuccess && (alerts.length > 0 || conditions.length > 0);
  const noRisks = isSuccess && alerts.length === 0 && conditions.length === 0;

  // TODO: check 204 response

  return isUninitialized || isFetching ? (
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
    </EmptyState>
  ) : hasRisks ? (
    <TableComposable
      aria-label="Upgrade risks table"
      isExpandable
      variant="compact"
    >
      <Thead>
        <Tr>
          <Th />
          <Th>Name</Th>
        </Tr>
      </Thead>
      <Tbody isExpanded={alertsExpanded}>
        <Tr>
          <Td
            expand={
              alertsDisabled
                ? {}
                : {
                    rowIndex: 0,
                    isExpanded: alertsExpanded,
                    onToggle: () => setAlertsExpanded(!alertsExpanded),
                  }
            }
          />
          <Td>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              {!alertsDisabled &&
                ALERTS_SEVERITY_ICONS[ // this algorithm helps to decide which icon (the most severe) to show
                  ALERTS_SEVERITY_ORDER.filter((s) =>
                    alerts.some(({ severity }) => s === severity)
                  )[0]
                ]}
              <b>Alerts firing</b>
              <Label isCompact>{alerts.length} upgrade risks</Label>
            </Flex>
          </Td>
        </Tr>
        <Tr isExpanded={alertsExpanded}>
          <Td />
          <Td>
            <ExpandableRowContent>
              Learn how to resolve your alert firing risks.
              <AlertsList />
            </ExpandableRowContent>
          </Td>
        </Tr>
      </Tbody>
      <Tbody isExpanded={operatorsExpanded}>
        <Tr>
          <Td
            expand={
              conditionsDisabled
                ? undefined
                : {
                    rowIndex: 1,
                    isExpanded: operatorsExpanded,
                    onToggle: () => setOperatorsExpanded(!operatorsExpanded),
                  }
            }
          />
          <Td>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              {!conditionsDisabled && (
                <Icon status="warning">
                  <ExclamationTriangleIcon />
                </Icon>
              )}
              <b>Cluster opertors</b>
              <Label isCompact>{conditions.length} upgrade risks</Label>
            </Flex>
          </Td>
        </Tr>
        <Tr isExpanded={operatorsExpanded}>
          <Td />
          <Td>
            <ExpandableRowContent>
              Learn how to resolve your cluster operator risks.
              <ClusterOperatorsList />
            </ExpandableRowContent>
          </Td>
        </Tr>
      </Tbody>
    </TableComposable>
  ) : noRisks ? (
    <UpgradeRisksNotAvailable />
  ) : (
    <ErrorState />
  );
};

export default UpgradeRisksTable;
