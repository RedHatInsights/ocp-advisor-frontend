import { Flex, Icon } from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetUpdateRisksState } from '../../Services/SmartProxy';

export const ALERTS_SEVERITY_ICONS = {
  critical: (
    <Icon status="danger">
      <ExclamationCircleIcon />
    </Icon>
  ),
  warning: (
    <Icon status="warning">
      <ExclamationTriangleIcon />
    </Icon>
  ),
  info: (
    <Icon status="info">
      <InfoCircleIcon />
    </Icon>
  ),
  success: (
    <Icon status="success">
      <CheckCircleIcon />
    </Icon>
  ),
};

export const ALERTS_SEVERITY_LABEL = {
  critical: (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      {ALERTS_SEVERITY_ICONS['critical']} <b>Critical</b>
    </Flex>
  ),
  warning: (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      {ALERTS_SEVERITY_ICONS['warning']} <b>Warning</b>
    </Flex>
  ),
  info: (
    <Flex alignItems={{ default: 'alignItemsCenter' }}>
      {ALERTS_SEVERITY_ICONS['info']} <b>Info</b>
    </Flex>
  ),
};

export const ALERTS_SEVERITY_ORDER = ['critical', 'warning', 'info'];

const AlertsList = () => {
  const { clusterId } = useParams();
  const { data } = useGetUpdateRisksState({ id: clusterId });
  const { alerts = [] } =
    data?.upgrade_recommendation?.upgrade_risks_predictors || {};

  return (
    <TableComposable
      aria-label="Alerts firing table"
      variant="compact"
      borders={false}
    >
      <Thead>
        <Tr>
          <Th width={50}>Name</Th>
          <Th width={25}>Status</Th>
          <Th width={25}>Namespace</Th>
        </Tr>
      </Thead>
      <Tbody>
        {alerts.map(({ name, namespace, severity, url = '' }) => (
          <Tr key={name}>
            <Td className="alerts__name">
              {url === '' ? name : <a href={url}>{name}</a>}
            </Td>
            <Td className="alerts__severity">
              {ALERTS_SEVERITY_LABEL[severity]}
            </Td>
            <Td className="alerts__namespace">{namespace}</Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default AlertsList;
