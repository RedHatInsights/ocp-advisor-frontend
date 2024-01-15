import React from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Title } from '@patternfly/react-core';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { ObjectsTableColumns } from '../../AppConstants';
import PropTypes from 'prop-types';
import Pagination from '@redhat-cloud-services/frontend-components/Pagination';

export const ObjectsModalTable = ({ objects }) => {
  return (
    <div id="objects-list-table">
      <Title headingLevel="h1" ouiaId="page-header">
        Objects
      </Title>
      <PrimaryToolbar
        pagination={{
          /*           page,
          perPage,
          onSetPage, */
          onPerPageSelect: () => console.log('pageChanged'),
          isCompact: true,
          ouiaId: 'pager',
        }}
      />
      <Table aria-label="Cell widths">
        <Thead>
          <Tr>
            <Th width={60}>{ObjectsTableColumns.object}</Th>
            <Th width={30}>{ObjectsTableColumns.kind}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {objects.map((object, index) => (
            <Tr key={index}>
              <Td dataLabel={ObjectsTableColumns.object}>{object.uid}</Td>
              <Td dataLabel={ObjectsTableColumns.kind}>{object.kind}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Pagination
        ouiaId="pager"
        /* itemCount={filteredRows.length}
        page={page}
        perPage={perPage}
        onSetPage={onSetPage}
        onPerPageSelect={onSetPerPage}
        onPageInput={onSetPage}
        widgetId={`pagination-options-menu-bottom`}*/
        variant={'bottom'}
      />
    </div>
  );
};

ObjectsModalTable.propTypes = {
  objects: PropTypes.arrayOf({
    kind: PropTypes.string,
    uid: PropTypes.string,
  }),
};
