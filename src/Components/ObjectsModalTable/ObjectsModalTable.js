import React, { useState } from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Title } from '@patternfly/react-core';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { ObjectsTableColumns } from '../../AppConstants';
import PropTypes from 'prop-types';
import Pagination from '@redhat-cloud-services/frontend-components/Pagination';
import { useDispatch, useSelector } from 'react-redux';
import {
  WORKLOADS_OBJECTS_TABLE_INITIAL_STATE,
  resetFilters,
  updateWorkloadsObjectsListFilters,
} from '../../Services/Filters';
import { removeFilterParam as _removeFilterParam } from '../Common/Tables';
import { pruneWorkloadsRulesFilters } from '../../Utilities/Workloads';

export const ObjectsModalTable = ({ objects }) => {
  const dispatch = useDispatch();
  const [filtersApplied, setFiltersApplied] = useState(false);
  const filters = useSelector(
    ({ filters }) => filters.workloadsObjectsListState
  );
  const removeFilterParam = (param) =>
    _removeFilterParam(filters, updateFilters, param);

  const updateFilters = (payload) =>
    dispatch(updateWorkloadsObjectsListFilters(payload));

  const filterConfigItems = [
    {
      label: 'Object ID',
      filterValues: {
        key: 'object_id',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, object_id: value }),
        value: filters.object_id,
        placeholder: 'Filter by Object ID',
      },
    },
  ];

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sortIndex;
    delete localFilters.sortDirection;
    return pruneWorkloadsRulesFilters(
      localFilters,
      WORKLOADS_OBJECTS_TABLE_INITIAL_STATE
    );
  };

  const activeFiltersConfig = {
    showDeleteButton: filtersApplied,
    deleteTitle: 'Reset filters',
    filters: buildFilterChips(),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        resetFilters(
          filters,
          WORKLOADS_OBJECTS_TABLE_INITIAL_STATE,
          updateFilters
        );
      } else {
        itemsToRemove.map((item) => {
          const newFilter = {
            [item.urlParam]: Array.isArray(filters[item.urlParam])
              ? filters[item.urlParam].filter(
                  (value) => String(value) !== String(item.chips[0].value)
                )
              : '',
          };
          newFilter[item.urlParam].length > 0
            ? updateFilters({ ...filters, ...newFilter })
            : removeFilterParam(item.urlParam);
        });
      }
    },
  };

  const buildFilteredRows = (allRows, filters) => {
    setRowsFiltered(false);
    const noFilters = filtersAreApplied(filters);
    return allRows
      .filter((recs) =>
        noFilters ? passFilterWorkloadsRecs(recs, filters) : true
      )
      .map((value, key) => [
        {
          rule: value,
          isOpen: isAllExpanded,
          cells: [
            {
              title: value.details,
            },
            {
              title: (
                <div key={key}>
                  <InsightsLabel value={4} rest={{ isCompact: true }} />
                </div>
              ),
            },
            {
              title: value.objects.length,
            },
            {
              title: (
                <div key={key}>
                  <DateFormat date={value.modified} type="relative" />
                </div>
              ),
            },
          ],
        },
        {
          cells: [
            {
              title: (
                <ExpandedRulesDetails
                  extra_data={value.extra_data}
                  more_info={value.more_info}
                  resolution={value.resolution}
                  objects={value.objects}
                />
              ),
            },
          ],
        },
      ]);
  };

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
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
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
