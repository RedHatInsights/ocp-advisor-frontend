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
import {
  NoUpgradeRisks,
  UpgradeRisksNotAvailable,
} from '../MessageState/EmptyStates';
import AlertsList, {
  ALERTS_SEVERITY_ICONS,
  ALERTS_SEVERITY_ORDER,
} from './AlertsList';
import ClusterOperatorsList from './ClusterOperatorsList';

const UpgradeRisksTable = () => {
  const { clusterId } = useParams();
  const { isError, isUninitialized, isFetching, isSuccess, data, error } =
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

  return isUninitialized || isFetching ? (
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
    </EmptyState>
  ) : (
    <TableComposable
      aria-label="Upgrade risks table"
      isExpandable
      variant="compact"
      id="upgrade-risks-table"
    >
      <Thead>
        <Tr>
          <Th />
          <Th>Name</Th>
        </Tr>
      </Thead>
      {hasRisks ? (
        <>
          <Tbody isExpanded={alertsExpanded}>
            <Tr className="alerts__header">
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
                  <Label isCompact id="alerts-label">
                    {alerts.length} upgrade risks
                  </Label>
                </Flex>
              </Td>
            </Tr>
            <Tr isExpanded={alertsExpanded} className="alerts__content">
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
            <Tr className="operators__header">
              <Td
                expand={
                  conditionsDisabled
                    ? undefined
                    : {
                        rowIndex: 1,
                        isExpanded: operatorsExpanded,
                        onToggle: () =>
                          setOperatorsExpanded(!operatorsExpanded),
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
                  <Label isCompact id="operator-conditions-label">
                    {conditions.length} upgrade risks
                  </Label>
                </Flex>
              </Td>
            </Tr>
            <Tr isExpanded={operatorsExpanded} className="operators__content">
              <Td />
              <Td>
                <ExpandableRowContent>
                  Learn how to resolve your cluster operator risks.
                  <ClusterOperatorsList />
                </ExpandableRowContent>
              </Td>
            </Tr>
          </Tbody>
        </>
      ) : noRisks ? (
        <Tbody>
          <Tr>
            <Td colSpan={2}>
              <NoUpgradeRisks />
            </Td>
          </Tr>
        </Tbody>
      ) : isError && error.status === 503 ? (
        <Tbody>
          <Tr>
            <Td colSpan={2}>
              <UpgradeRisksNotAvailable />
              {/* back end is temporarily not available */}
            </Td>
          </Tr>
        </Tbody>
      ) : (
        <Tbody>
          <Tr>
            <Td colSpan={2}>
              <ErrorState />
              {/* default state for unexpected errors */}
            </Td>
          </Tr>
        </Tbody>
      )}
    </TableComposable>
  );
};

export default UpgradeRisksTable;
