import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
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
import { ErrorState, NoMatchingClusters } from '../MessageState/EmptyStates';
import Loading from '../Loading/Loading';
import mockdata from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workloads.json';
import ShieldSet from '../ShieldSet';

const WorkloadsListTable = ({
  query: { isError, isUninitialized, isFetching, isSuccess, data },
}) => {
  const dispatch = useDispatch();
  const filters = useSelector(({ filters }) => filters.workloadsListState);
  //const workloads = data?.workloads || [];
  const workloads = mockdata;

  const [rows, setRows] = React.useState([]);
  const updateFilters = (payload) =>
    dispatch(updateWorkloadsListFilters(payload));

  const loadingState = isUninitialized || isFetching;
  const errorState = isError;
  const noMatch = rows.length === 0;
  const successState = isSuccess;

  useEffect(() => {
    setRows(buildRows(workloads));
  }, [data]);

  const buildRows = (items) => {
    return items.map((item, index) => {
      return {
        entity: item,
        cells: [
          <span key={index}>
            <Link
              to={`${BASE_PATH}/workloads/${item.cluster.uuid}/${item.namespace.uuid}`}
            >
              <p key={`${index}-cluster`}>{item.cluster.display_name}</p>
              <p key={`${index}-namespace`}>{item.namespace.name}</p>
            </Link>
          </span>,
          item.metadata.recommendations,
          <span key={index}>
            <ShieldSet hits_by_severity={item.metadata.hits_by_severity} />
            {/* <HighestSeverityBadge
              highestSeverity={item.metadata.highest_severity}
              severities={item.metadata.hits_by_severity}
            /> */}
          </span>,
          item.metadata.objects,
          <span key={index}>
            <DateFormat
              extraTitle="Last seen: "
              date={item.metadata.last_checked_at}
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
        key: 'cluster_name',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, cluster_name: value }),
        value: filters.cluster_name,
        placeholder: 'Filter by cluster name',
      },
    },
    {
      label: 'Namespace name',
      filterValues: {
        key: 'namespace_name',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, namespace_name: value }),
        value: filters.namespace_name,
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
          itemCount: data?.workloads.length || 0,
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
        rows={
          errorState || loadingState || noMatch ? (
            [
              {
                fullWidth: true,
                cells: [
                  {
                    props: {
                      colSpan: WORKLOADS_LIST_COLUMNS.length + 1,
                    },
                    title: errorState ? (
                      <ErrorState />
                    ) : loadingState ? (
                      <Loading />
                    ) : (
                      <NoMatchingClusters />
                    ),
                  },
                ],
              },
            ]
          ) : successState ? (
            rows
          ) : (
            <ErrorState />
          )
        }
        isStickyHeader
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        ouiaId="pager"
        itemCount={data?.workloads.length || 0}
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

WorkloadsListTable.propTypes = {
  query: PropTypes.object.isRequired,
};

export { WorkloadsListTable };
