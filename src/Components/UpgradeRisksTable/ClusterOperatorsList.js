import React from 'react';
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useParams } from 'react-router-dom';
import { useGetUpgradeRisksQuery } from '../../Services/SmartProxy';
import { Flex, Icon } from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';

export const CLUSTER_OPERATOR_LABEL = {
  degraded: 'Degraded',
  failing: 'Failing',
  available: 'Not Available',
  upgradeable: 'Not Upgradeable',
};

const ClusterOperatorsList = () => {
  const { clusterId } = useParams();
  const { data } = useGetUpgradeRisksQuery({ id: clusterId });
  const { operator_conditions: conditions = [] } =
    data?.upgrade_recommendation?.upgrade_risks_predictors || {};

  return (
    <TableComposable
      aria-label="Cluster operators firing table"
      variant="compact"
      borders={false}
    >
      <Thead>
        <Tr>
          <Th width={50}>Name</Th>
          <Th width={25}>Status</Th>
          <Th width={25}>Message</Th>
        </Tr>
      </Thead>
      <Tbody>
        {conditions.map(({ name, condition, reason }) => (
          <Tr key={name}>
            <Td>{name}</Td>
            <Td>
              <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <Icon status="warning">
                  <ExclamationTriangleIcon />
                </Icon>
                <b>{CLUSTER_OPERATOR_LABEL[condition]}</b>
              </Flex>
            </Td>
            <Td>{reason || '-'}</Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default ClusterOperatorsList;
