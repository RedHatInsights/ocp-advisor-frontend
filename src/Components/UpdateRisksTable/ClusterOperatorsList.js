import React from 'react';
import {
  Table /* data-codemods */,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { useParams } from 'react-router-dom';
import { useGetUpdateRisksState } from '../../Services/SmartProxy';
import { Flex, Icon } from '@patternfly/react-core';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

const ClusterOperatorsList = () => {
  const { clusterId } = useParams();
  const { data } = useGetUpdateRisksState({ id: clusterId });
  const { operator_conditions: conditions = [] } =
    data?.upgrade_recommendation?.upgrade_risks_predictors || {};

  return (
    <Table
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
        {conditions.map(({ name, condition, reason, url = '' }) => (
          <Tr key={name}>
            <Td class="operators__name">
              {url === '' ? name : <a href={url}>{name}</a>}
            </Td>
            <Td class="operators__status">
              <Flex alignItems={{ default: 'alignItemsCenter' }}>
                <Icon status="warning">
                  <ExclamationTriangleIcon />
                </Icon>
                <b>{condition}</b>
              </Flex>
            </Td>
            <Td class="operators__message">{reason || '-'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default ClusterOperatorsList;
