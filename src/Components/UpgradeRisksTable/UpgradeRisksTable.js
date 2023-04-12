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
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/esm/icons/info-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

import React, { useState } from 'react';

const UpgradeRisksTable = () => {
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [operatorsExpanded, setOperatorsExpanded] = useState(true);

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
              <Icon status="warning">
                <ExclamationTriangleIcon />
              </Icon>{' '}
              <b>Alerts firing</b> <Label isCompact>4 upgrade risks</Label>
            </Flex>
          </Td>
        </Tr>
        <Tr isExpanded={alertsExpanded}>
          <Td />
          <Td>
            <ExpandableRowContent>
              Learn how to resolve your alert firing risks.
              <TableComposable
                aria-label="Alerts firing table"
                variant="compact"
                borders={false}
              >
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Namespace</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>ClusterOperatorDown</Td>
                    <Td>
                      {' '}
                      <Flex alignItems={{ default: 'alignItemsCenter' }}>
                        <Icon status="danger">
                          <ExclamationCircleIcon />
                        </Icon>{' '}
                        <b>Critical</b>
                      </Flex>
                    </Td>
                    <Td>openshift-monitoring</Td>
                  </Tr>
                  <Tr>
                    <Td>ClusterOperatorDown</Td>
                    <Td>
                      <Flex alignItems={{ default: 'alignItemsCenter' }}>
                        <Icon status="info">
                          <InfoCircleIcon />
                        </Icon>{' '}
                        <b>Info</b>
                      </Flex>
                    </Td>
                    <Td>openshift-monitoring</Td>
                  </Tr>
                </Tbody>
              </TableComposable>
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
              <Icon status="danger">
                <ExclamationCircleIcon />
              </Icon>{' '}
              <b>Cluster opertors</b> <Label isCompact>3 upgrade risks</Label>
            </Flex>
          </Td>
        </Tr>
        <Tr isExpanded={operatorsExpanded}>
          <Td />
          <Td>
            <ExpandableRowContent>
              Learn how to resolve your cluster operator risks.
              <TableComposable
                aria-label="Alerts firing table"
                variant="compact"
                borders={false}
              >
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Status</Th>
                    <Th>Message</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>ClusterOperatorDown</Td>
                    <Td>
                      {' '}
                      <Flex alignItems={{ default: 'alignItemsCenter' }}>
                        <Icon status="warning">
                          <ExclamationTriangleIcon />
                        </Icon>{' '}
                        <b>Warning</b>
                      </Flex>
                    </Td>
                    <Td>openshift-monitoring</Td>
                  </Tr>
                </Tbody>
              </TableComposable>
            </ExpandableRowContent>
          </Td>
        </Tr>
      </Tbody>
    </TableComposable>
  );
};

export default UpgradeRisksTable;
