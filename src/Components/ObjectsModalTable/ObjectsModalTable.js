import React, { useEffect, useState } from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { ObjectsTableColumns } from '../../AppConstants';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  WORKLOADS_OBJECTS_TABLE_INITIAL_STATE,
  resetFilters,
  updateWorkloadsObjectsListFilters,
} from '../../Services/Filters';
import { removeFilterParam as _removeFilterParam } from '../Common/Tables';
import { Pagination } from '@patternfly/react-core';
import {
  filtersAreApplied,
  passObjectsFilters,
  pruneWorkloadsRulesFilters,
} from '../../Utilities/Workloads';
import { NoMatchingWorkloadsObjects } from '../MessageState/EmptyStates';
import Loading from '../Loading/Loading';
import { PaginationVariant } from '@patternfly/react-core/dist/js/components/Pagination/Pagination';

export const ObjectsModalTable = ({ objects }) => {
  const objectsData = objects || [];
  const dispatch = useDispatch();
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [rowsFiltered, setRowsFiltered] = useState(false);
  const filters = useSelector(
    ({ filters }) => filters.workloadsObjectsListState
  );
  const page = Math.floor(filters.offset / filters.limit) + 1;
  const perPage = filters.limit;

  const removeFilterParam = (param) =>
    _removeFilterParam(filters, updateFilters, param);

  const updateFilters = (payload) =>
    dispatch(updateWorkloadsObjectsListFilters(payload));
  const preparedRows = displayedRows.length > 0 ? true : false;
  const loadingState = !rowsFiltered;

  const filterConfigItems = [
    {
      label: 'Object ID',
      type: 'text',
      filterValues: {
        key: 'object_id',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, object_id: value }),
        value: filters.object_id,
        placeholder: 'Filter by Object ID',
      },
    },
    {
      label: 'Object name',
      type: 'text',
      filterValues: {
        key: 'display_name',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, display_name: value }),
        value: filters.display_name,
        placeholder: 'Filter by name',
      },
    },
  ];

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sortIndex;
    delete localFilters.sortDirection;
    return pruneWorkloadsRulesFilters(
      localFilters,
      {
        label: 'Object ID',
        type: 'text',
        title: 'object ID',
        urlParam: 'object_id',
      },
      {
        label: 'Object name',
        type: 'text',
        title: 'object name',
        urlParam: 'display_name',
      }
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

  //This is where we apply filters and map rows agains the filters
  const buildFilteredRows = (allrows, filters) => {
    return allrows.filter((object) => passObjectsFilters(object, filters));
  };

  //building displayed rows applying limits and per page values
  const buildDisplayedRows = (rows) => {
    return rows.slice(perPage * (page - 1), perPage * (page - 1) + perPage);
  };

  //After objectsData is present or in case of object id filter change we setFiltered rows using buildiflterRows
  useEffect(() => {
    setFilteredRows(buildFilteredRows(objectsData, filters));
  }, [objectsData, filters]);

  //after objects data is present we set filtered rows and this useEffect is triggered to update displayed rows
  //with new array of rows that have filters applied
  useEffect(() => {
    setDisplayedRows(buildDisplayedRows(filteredRows));
    setFiltersApplied(filtersAreApplied(filters));
    setRowsFiltered(true);
  }, [filteredRows, filters.limit, filters.offset]);

  const onSetPage = (_e, pageNumber) => {
    const newOffset = pageNumber * filters.limit - filters.limit;
    updateFilters({ ...filters, offset: newOffset });
  };

  const onPerPageSelect = (_e, perPage) => {
    if (perPage !== filters.limit) {
      updateFilters({ ...filters, limit: perPage, offset: 0 });
    }
  };

  return (
    <div id="objects-list-table">
      <PrimaryToolbar
        pagination={{
          page,
          perPage,
          onSetPage,
          onPerPageSelect,
          isCompact: true,
          ouiaId: 'pager',
          itemCount: filteredRows.length,
        }}
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
      />
      {loadingState ? (
        <Loading />
      ) : preparedRows ? (
        <div>
          <Table aria-label="Cell widths" variant="compact">
            <Thead>
              <Tr>
                <Th width={30}>{ObjectsTableColumns.display_name}</Th>
                <Th width={60}>{ObjectsTableColumns.object}</Th>
                <Th width={30}>{ObjectsTableColumns.kind}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayedRows?.map((object, index) => (
                <Tr key={index}>
                  <Td dataLabel={ObjectsTableColumns.display_name}>
                    {object.display_name}
                  </Td>
                  <Td dataLabel={ObjectsTableColumns.object}>{object.uid}</Td>
                  <Td dataLabel={ObjectsTableColumns.kind}>{object.kind}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {displayedRows.length > 0 ? (
            <Pagination
              ouiaId="pager"
              itemCount={filteredRows.length}
              page={page}
              perPage={perPage}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
              onPageInput={onSetPage}
              widgetId={`pagination-options-menu-bottom`}
              variant={PaginationVariant.bottom}
            />
          ) : (
            <Pagination
              itemCount={0}
              perPage
              page
              onSetPage
              onPerPageSelect
              isDisabled
            />
          )}
        </div>
      ) : (
        <NoMatchingWorkloadsObjects />
      )}
    </div>
  );
};

ObjectsModalTable.propTypes = {
  objects: PropTypes.arrayOf(
    PropTypes.shape({
      kind: PropTypes.string,
      uid: PropTypes.string,
    })
  ),
};
