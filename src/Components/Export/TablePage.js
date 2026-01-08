import PropTypes from 'prop-types';
import React from 'react';
import {
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { t_global_background_color_secondary_default } from '@patternfly/react-tokens';

export const TablePage = ({ clusters, styles }) => {
  const header = [
    { value: 'Name', style: { fontSize: 8, width: '200px' } },
    {
      value: 'Version',
      style: { fontSize: 8, textAlign: 'center', width: '80px' },
    },
    {
      value: 'Recommendations',
      style: { fontSize: 8, textAlign: 'center', width: '80px' },
    },
    {
      value: 'Critical',
      style: { fontSize: 8, textAlign: 'center', width: '60px' },
    },
    {
      value: 'Important',
      style: { fontSize: 8, textAlign: 'center', width: '60px' },
    },
    {
      value: 'Moderate',
      style: { fontSize: 8, textAlign: 'center', width: '60px' },
    },
    {
      value: 'Low',
      style: { fontSize: 8, textAlign: 'center', width: '60px' },
    },
    { value: 'Last Seen', style: { fontSize: 8, width: '120px' } },
  ];

  const headerBuilder = ({ value, style }) => (
    <Th style={{ ...style, ...styles.bold }}>{value}</Th>
  );

  const rowBuilder = ({ value }) => (
    <Td
      noPadding={true}
      style={{ fontSize: 8, paddingTop: '1px', paddingBottom: '1px' }}
    >
      {value}
    </Td>
  );

  const rows =
    clusters?.map((cluster, idx) => {
      const [, date, month, year, time] = new Date(cluster.last_seen)
        .toUTCString()
        .split(' ');
      const clusterDate = `${date} ${month} ${year}, ${time
        .split(':')
        .slice(0, 2)
        .join(':')} UTC`;

      const isOddRow = (idx + 1) % 2;
      const customStyle = {
        backgroundColor: t_global_background_color_secondary_default.var,
      };

      return (
        <Tr
          noPadding={true}
          key={cluster.cluster_id || cluster.cluster_name}
          style={isOddRow ? customStyle : {}}
        >
          <Td style={{ fontSize: 8 }} noPadding={true}>
            <a
              style={styles.link}
              href={`/openshift/insights/advisor/clusters/${cluster.cluster_id}`}
            >
              {cluster.cluster_name || cluster.display_name}
            </a>
          </Td>
          {rowBuilder({ value: cluster.version || 'N/A' })}
          {rowBuilder({ value: cluster.recommendations || cluster.hits || 0 })}
          {rowBuilder({ value: cluster.critical_hits || 0 })}
          {rowBuilder({ value: cluster.important_hits || 0 })}
          {rowBuilder({ value: cluster.moderate_hits || 0 })}
          {rowBuilder({ value: cluster.low_hits || 0 })}
          <Td style={{ fontSize: 8 }} noPadding={true}>
            {clusterDate}
          </Td>
        </Tr>
      );
    }) || [];

  return (
    <Table
      aria-label={'export-table'}
      ouiaId={'export-table'}
      variant={TableVariant.compact}
    >
      <Thead>
        <Tr>
          {header.map((colHeader, idx) =>
            headerBuilder({
              value: colHeader.value,
              style: colHeader.style,
              key: idx,
            }),
          )}
        </Tr>
      </Thead>
      <Tbody>{rows}</Tbody>
    </Table>
  );
};

TablePage.propTypes = {
  clusters: PropTypes.array,
  styles: PropTypes.object,
};

export default TablePage;
