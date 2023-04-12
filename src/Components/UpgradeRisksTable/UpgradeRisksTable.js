import { Flex, Icon, Label } from '@patternfly/react-core';
import {
  ExpandableRowContent,
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import React, { useState } from 'react';
import { useGetUpgradeRisksQuery } from '../../Services/SmartProxy';
import { useParams } from 'react-router-dom';
import AlertsList, {
  ALERTS_SEVERITY_ICONS,
  ALERTS_SEVERITY_ORDER,
} from './AlertsList';
import ClusterOperatorsList from './ClusterOperatorsList';

const UpgradeRisksTable = () => {
  const { clusterId } = useParams();
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [operatorsExpanded, setOperatorsExpanded] = useState(true);
  const { data } = useGetUpgradeRisksQuery({ id: clusterId });
  const { alerts = [], operator_conditions: conditions = [] } =
    data?.upgrade_recommendation?.upgrade_risks_predictors || {};

  return (
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
            expand={{
              rowIndex: 0,
              isExpanded: alertsExpanded,
              onToggle: () => setAlertsExpanded(!alertsExpanded),
            }}
          />
          <Td>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              {
                ALERTS_SEVERITY_ICONS[ // this algorithm helps to decide which icon (the most severe) to show
                  ALERTS_SEVERITY_ORDER.filter((s) =>
                    alerts.some(({ severity }) => s === severity)
                  )[0]
                ]
              }
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
            expand={{
              rowIndex: 1,
              isExpanded: operatorsExpanded,
              onToggle: () => setOperatorsExpanded(!operatorsExpanded),
            }}
          />
          <Td>
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <Icon status="warning">
                <ExclamationTriangleIcon />
              </Icon>
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
  );
};

export default UpgradeRisksTable;
