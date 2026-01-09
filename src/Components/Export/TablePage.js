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
      const lastChecked = cluster.last_checked_at || cluster.last_seen;
      const [, date, month, year, time] = lastChecked
        ? new Date(lastChecked).toUTCString().split(' ')
        : ['', 'N/A', '', '', ''];
      const clusterDate = lastChecked
        ? `${date} ${month} ${year}, ${time.split(':').slice(0, 2).join(':')} UTC`
        : 'N/A';

      const isOddRow = (idx + 1) % 2;
      const customStyle = {
        backgroundColor: t_global_background_color_secondary_default.var,
      };

      const hitsByRisk = cluster.hits_by_total_risk || {};

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
          {rowBuilder({ value: cluster.cluster_version || 'N/A' })}
          {rowBuilder({ value: cluster.total_hit_count || 0 })}
          {rowBuilder({ value: hitsByRisk['4'] || 0 })}
          {rowBuilder({ value: hitsByRisk['3'] || 0 })}
          {rowBuilder({ value: hitsByRisk['2'] || 0 })}
          {rowBuilder({ value: hitsByRisk['1'] || 0 })}
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
