import PropTypes from 'prop-types';
import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableVariant,
} from '@patternfly/react-table';
import {
  t_color_red_50,
  t_global_background_color_primary_default,
} from '@patternfly/react-tokens';

const RecommendationCharts = ({ columnHeader, header, rows }) => {
  return (
    <React.Fragment>
      <span style={{ color: t_color_red_50.value }}>
        {header}
      </span>
      <Flex spaceItems={{ default: 'spaceItemsLg' }}>
        <FlexItem style={{ width: '60%' }}>
          <Table
            aria-label={'recommendation-chart-table'}
            ouiaId={'recommendation-chart-table'}
            variant={TableVariant.compact}
          >
            <Thead>
              <Tr>
                <Th>{columnHeader}</Th>
                <Th># of Recommendations</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows?.map((item, index) => (
                <Tr
                  key={`${columnHeader}-row-${index}`}
                  style={{
                    backgroundColor:
                      (index + 1) % 2 &&
                      t_global_background_color_primary_default.var,
                    fontSize: '12px',
                  }}
                >
                  <Td style={{ fontSize: '12px' }}>{item[0]}</Td>
                  <Td style={{ fontSize: '12px' }}>{item[1]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </FlexItem>
      </Flex>
    </React.Fragment>
  );
};

RecommendationCharts.propTypes = {
  columnHeader: PropTypes.string,
  header: PropTypes.string,
  rows: PropTypes.array,
};

export default RecommendationCharts;
