import React, { useEffect } from 'react';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { PaginationVariant } from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import {
  WORKLOADS_LIST_COLUMNS,
  WORKLOADS_TABLE_FILTER_CATEGORIES,
} from '../../AppConstants';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { Link } from 'react-router-dom';
import { BASE_PATH } from '../../Routes';
import { HighestSeverityBadge } from '../HighestSeverityBadge/HighestSeverityBadge';
import { Pagination } from '@patternfly/react-core';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter/conditionalFilterConstants';
import { useDispatch, useSelector } from 'react-redux';
import {
  WORKLOADS_TABLE_INITIAL_STATE,
  resetFilters,
  updateWorkloadsListFilters,
} from '../../Services/Filters';
import isEqual from 'lodash/isEqual';
import { buildFilterChips } from '../Common/Tables';

const workloadsData = [
  {
    workload_id: 'asd4134asd-1234241',
    workload_name: 'Workload 1',
    risks: {
      1: 2,
      2: 0,
      3: 3,
      4: 1,
    },
    recommendations: 4,
    objects: 14,
    lastSeen: '2023-10-30T09:55:52Z',
  },
  {
    workload_id: 'worklooaaaasd-2',
    workload_name: 'Workload 2',
    risks: {
      1: 1,
      2: 3,
      3: 2,
      4: 0,
    },
    recommendations: 5,
    objects: 3,
    lastSeen: '2023-10-30T05:55:52Z',
  },
];

const WorkloadsListTable = () => {
  const dispatch = useDispatch();
  const workloads = workloadsData;
  const filters = useSelector(({ filters }) => filters.workloadsListState);
  console.log(filters);
  const [rows, setRows] = React.useState([]);
  const updateFilters = (payload) =>
    dispatch(updateWorkloadsListFilters(payload));

  useEffect(() => {
    setRows(buildRows(workloads));
  }, [workloads]);

  const buildRows = (items) => {
    return items.map((item, index) => {
      return {
        entity: item,
        cells: [
          <span key={index}>
            <Link to={`${BASE_PATH}/workloads/${item.workload_id}`}>
              {item.workload_name || item.workload_id}
            </Link>
          </span>,
          item.recommendations,
          <span key={index}>
            <HighestSeverityBadge severities={item.risks} />
          </span>,
          item.objects,
          <span key={Math.random()}>
            <DateFormat
              extraTitle="Last seen: "
              date={item.lastSeen}
              variant="relative"
            />
          </span>,
        ],
      };
    });
  };

  const filterConfigItems = [
    {
      label: 'Cluster name',
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, text: value }),
        value: filters.text,
        placeholder: 'Filter by cluster name',
      },
    },
    {
      label: 'Namespace name',
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, text: value }),
        value: filters.text,
        placeholder: 'Filter by namespace name',
      },
    },
    {
      label: 'Highest severity',
      type: conditionalFilterType.checkbox,
      id: WORKLOADS_TABLE_FILTER_CATEGORIES.highest_severity.urlParam,
      value: `checkbox-${WORKLOADS_TABLE_FILTER_CATEGORIES.highest_severity.urlParam}`,
      filterValues: {
        key: `${WORKLOADS_TABLE_FILTER_CATEGORIES.highest_severity.urlParam}-filter`,
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, highest_severity: value }),
        value: filters.highest_severity,
        items: WORKLOADS_TABLE_FILTER_CATEGORIES.highest_severity.values,
        placeholder: 'Filter by highest severity',
      },
    },
  ];

  const activeFiltersConfig = {
    showDeleteButton: true,
    deleteTitle: 'Reset filters',
    filters: buildFilterChips(filters, WORKLOADS_TABLE_FILTER_CATEGORIES),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        if (isEqual(filters, WORKLOADS_TABLE_INITIAL_STATE)) {
          console.log('here should be a refetch!');
        } else {
          resetFilters(filters, WORKLOADS_TABLE_INITIAL_STATE, updateFilters);
        }
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
            : console.log(
                'here we should remove the filter parameter from a URL!'
              );
        });
      }
    },
  };

  return (
    <div id="workloads-list-table">
      <PrimaryToolbar
        pagination={{
          itemCount: 2,
          page: 1,
          perPage: 20,
          onSetPage: () => console.log('here should be a pagination'),
          onPerPageSelect: () => console.log('here should be a pagination'),
          isCompact: true,
          ouiaId: 'pager',
        }}
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
      />
      <Table
        aria-label="Table of workloads"
        ouiaId="workloads"
        variant={TableVariant.compact}
        cells={WORKLOADS_LIST_COLUMNS}
        rows={rows}
        isStickyHeader
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        ouiaId="pager"
        itemCount={2}
        page={1}
        perPage={20}
        onSetPage={() => {}}
        onPerPageSelect={() => {}}
        widgetId={`pagination-options-menu-bottom`}
        variant={PaginationVariant.bottom}
      />
    </div>
  );
};

export { WorkloadsListTable };
