import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';
import { useLocation } from 'react-router-dom';
import uniqBy from 'lodash/uniqBy';
import { valid } from 'semver';
import { Link } from 'react-router-dom';

import { SortByDirection, TableVariant } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
import { Pagination, Tooltip } from '@patternfly/react-core';
import { PaginationVariant } from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar/PrimaryToolbar';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';

import {
  CLUSTERS_LIST_INITIAL_STATE,
  resetFilters,
  updateClustersListFilters,
} from '../../Services/Filters';
import {
  CLUSTERS_LIST_COLUMNS,
  CLUSTERS_LIST_COLUMNS_KEYS,
  CLUSTERS_TABLE_CELL_NAME,
  CLUSTERS_TABLE_CELL_LAST_SEEN,
  CLUSTERS_TABLE_CELL_VERSION,
  CLUSTER_FILTER_CATEGORIES,
} from '../../AppConstants';
import {
  buildFilterChips,
  paramParser,
  passFiltersCluster,
  removeFilterParam as _removeFilterParam,
  addFilterParam as _addFilterParam,
  translateSortParams,
  updateSearchParams,
  compareSemVer,
  toValidSemVer,
} from '../Common/Tables';
import Loading from '../Loading/Loading';
import messages from '../../Messages';
import {
  ErrorState,
  NoMatchingClusters,
  NoRecsForClusters,
} from '../MessageState/EmptyStates';
import { coerce } from 'semver';
import { BASE_PATH } from '../../Routes';

const ClustersListTable = ({
  query: { isError, isUninitialized, isFetching, isSuccess, data, refetch },
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const updateFilters = (payload) =>
    dispatch(updateClustersListFilters(payload));
  const filters = useSelector(({ filters }) => filters.clustersListState);

  const clusters = data?.data || [];
  const page = filters.offset / filters.limit + 1;

  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  // helps to distinguish the state when the API data received but not yet filtered
  const [rowsFiltered, setRowsFiltered] = useState(false);
  const [filterBuilding, setFilterBuilding] = useState(true);
  const { search } = useLocation();
  const loadingState = isUninitialized || isFetching || !rowsFiltered;
  const errorState = isError;
  const noMatch = clusters.length > 0 && filteredRows.length === 0;
  const successState = isSuccess;

  const removeFilterParam = (param) =>
    _removeFilterParam(filters, updateFilters, param);

  const addFilterParam = (param, values) =>
    _addFilterParam(filters, updateFilters, param, values);

  useEffect(() => {
    setDisplayedRows(buildDisplayedRows(filteredRows));
    setRowsFiltered(true);
  }, [filteredRows, filters.limit, filters.offset]);

  useEffect(() => {
    setFilteredRows(buildFilteredRows(clusters));
  }, [
    data,
    filters.text,
    filters.version,
    filters.hits,
    filters.sortDirection,
    filters.sortIndex,
  ]);

  useEffect(() => {
    if (search && filterBuilding) {
      const paramsObject = paramParser(search);

      if (paramsObject.sort) {
        const sortObj = translateSortParams(paramsObject.sort);
        paramsObject.sortIndex = CLUSTERS_LIST_COLUMNS_KEYS.indexOf(
          sortObj.name
        );
        paramsObject.sortDirection = sortObj.direction;
      }
      paramsObject.offset &&
        (paramsObject.offset = Number(paramsObject.offset[0]));
      paramsObject.limit &&
        (paramsObject.limit = Number(paramsObject.limit[0]));
      paramsObject.impacting &&
        !Array.isArray(paramsObject.impacting) &&
        (paramsObject.impacting = [`${paramsObject.impacting}`]);
      updateFilters({ ...filters, ...paramsObject });
    }
    setFilterBuilding(false);
  }, []);

  useEffect(() => {
    if (!filterBuilding) {
      updateSearchParams(filters, CLUSTERS_LIST_COLUMNS_KEYS);
    }
  }, [filters, filterBuilding]);

  const buildFilteredRows = (items) => {
    setRowsFiltered(false);
    const filtered = items.filter((it) => {
      return passFiltersCluster(it, filters);
    });
    const mapped = filtered.map((it, index) => {
      if (
        it.cluster_version !== undefined &&
        it.cluster_version !== '' &&
        !valid(coerce(it.cluster_version))
      ) {
        console.error(
          `Cluster version ${it.cluster_version} has invalid format!`
        );
      }
      const ver = toValidSemVer(it.cluster_version);

      return {
        entity: it,
        cells: [
          <span key={index}>
            <Link to={`${BASE_PATH}/clusters/${it.cluster_id}`}>
              {it.cluster_name || it.cluster_id}
            </Link>
          </span>,
          ver === '0.0.0' ? intl.formatMessage(messages.nA) : ver,
          it.total_hit_count,
          it.hits_by_total_risk?.[4] || 0,
          it.hits_by_total_risk?.[3] || 0,
          it.hits_by_total_risk?.[2] || 0,
          it.hits_by_total_risk?.[1] || 0,
          <span key={index}>
            {it.last_checked_at ? (
              <DateFormat
                extraTitle={`${intl.formatMessage(messages.lastSeen)}: `}
                date={it.last_checked_at}
                variant="relative"
              />
            ) : (
              <Tooltip
                key={index}
                content={
                  <span>
                    {intl.formatMessage(messages.lastSeen) + ': '}
                    {intl.formatMessage(messages.nA)}
                  </span>
                }
              >
                <span>{intl.formatMessage(messages.nA)}</span>
              </Tooltip>
            )}
          </span>,
        ],
      };
    });
    const sorted =
      filters.sortIndex === -1
        ? mapped
        : mapped.sort((a, b) => {
            let fst, snd;
            const d = filters.sortDirection === SortByDirection.asc ? 1 : -1;
            switch (filters.sortIndex) {
              case CLUSTERS_TABLE_CELL_NAME:
                fst = a.entity.cluster_name || a.entity.cluster_id;
                snd = b.entity.cluster_name || b.entity.cluster_id;
                return fst.localeCompare(snd) ? fst.localeCompare(snd) * d : 0;
              case CLUSTERS_TABLE_CELL_VERSION:
                return compareSemVer(
                  toValidSemVer(a.entity.cluster_version),
                  toValidSemVer(b.entity.cluster_version),
                  d
                );
              case CLUSTERS_TABLE_CELL_LAST_SEEN:
                fst = new Date(a.entity.last_checked_at || 0);
                snd = new Date(b.entity.last_checked_at || 0);
                return fst > snd ? d : snd > fst ? -d : 0;
              default:
                fst = a.cells[filters.sortIndex];
                snd = b.cells[filters.sortIndex];
                return fst > snd ? d : snd > fst ? -d : 0;
            }
          });
    return sorted;
  };

  const buildDisplayedRows = (items) =>
    items.slice(
      filters.limit * (page - 1),
      filters.limit * (page - 1) + filters.limit
    );

  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      type: 'text',
      filterValues: {
        key: 'text',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, text: value }),
        value: filters.text,
        placeholder: intl.formatMessage(messages.filterByName),
      },
    },
    {
      label: intl.formatMessage(messages.version),
      placeholder: intl.formatMessage(messages.filterByVersion),
      type: 'checkbox',
      filterValues: {
        id: 'version-filter',
        key: 'version-filter',
        onChange: (event, value) => addFilterParam('version', value),
        value: filters.version,
        items: uniqBy(
          clusters
            .filter(
              (c) => c.cluster_version !== undefined && c.cluster_version !== ''
            )
            .map((c) => ({
              value: toValidSemVer(c.cluster_version),
            }))
            .sort((a, b) =>
              compareSemVer(
                toValidSemVer(a.cluster_version),
                toValidSemVer(b.cluster_version),
                1
              )
            )
            .reverse(), // should start from the latest version
          'value'
        ),
      },
    },
    {
      label: CLUSTER_FILTER_CATEGORIES.hits.title,
      type: 'checkbox',
      id: CLUSTER_FILTER_CATEGORIES.hits.urlParam,
      value: `checkbox-${CLUSTER_FILTER_CATEGORIES.hits.urlParam}`,
      filterValues: {
        key: `${CLUSTER_FILTER_CATEGORIES.hits.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(CLUSTER_FILTER_CATEGORIES.hits.urlParam, values),
        value: filters.hits,
        items: CLUSTER_FILTER_CATEGORIES.hits.values,
      },
    },
  ];

  const activeFiltersConfig = {
    showDeleteButton: true,
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(filters, CLUSTER_FILTER_CATEGORIES),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        if (isEqual(filters, CLUSTERS_LIST_INITIAL_STATE)) {
          refetch();
        } else {
          resetFilters(filters, CLUSTERS_LIST_INITIAL_STATE, updateFilters);
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
            : removeFilterParam(item.urlParam);
        });
      }
    },
  };

  const onSort = (_e, index, direction) => {
    setRowsFiltered(false);
    updateFilters({ ...filters, sortIndex: index, sortDirection: direction });
  };

  return (
    <>
      {isSuccess && clusters.length === 0 ? (
        <NoRecsForClusters /> // TODO: do not mix this logic in the table component
      ) : (
        <div id="clusters-list-table" data-ouia-safe={!loadingState}>
          <PrimaryToolbar
            pagination={{
              itemCount: filteredRows.length,
              page,
              perPage: filters.limit,
              onSetPage: (_event, page) => {
                setRowsFiltered(false);
                return updateFilters({
                  ...filters,
                  offset: filters.limit * (page - 1),
                });
              },
              onPerPageSelect: (_event, perPage) => {
                setRowsFiltered(false);
                return updateFilters({ ...filters, limit: perPage, offset: 0 });
              },
              isCompact: true,
              ouiaId: 'pager',
            }}
            filterConfig={{ items: filterConfigItems }}
            activeFiltersConfig={activeFiltersConfig}
          />
          <Table
            aria-label="Table of clusters"
            ouiaId="clusters"
            ouiaSafe={!loadingState}
            variant={TableVariant.compact}
            cells={CLUSTERS_LIST_COLUMNS}
            rows={
              errorState || loadingState || noMatch ? (
                [
                  {
                    fullWidth: true,
                    cells: [
                      {
                        props: {
                          colSpan: CLUSTERS_LIST_COLUMNS.length + 1,
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
                displayedRows
              ) : (
                <ErrorState />
              )
            }
            sortBy={{
              index: filters.sortIndex,
              direction: filters.sortDirection,
            }}
            onSort={onSort}
            isStickyHeader
          >
            <TableHeader />
            <TableBody />
          </Table>
          <Pagination
            ouiaId="pager"
            itemCount={filteredRows.length}
            page={filters.offset / filters.limit + 1}
            perPage={Number(filters.limit)}
            onSetPage={(_e, page) =>
              updateFilters({
                ...filters,
                offset: filters.limit * (page - 1),
              })
            }
            onPerPageSelect={(_e, perPage) =>
              updateFilters({ ...filters, limit: perPage, offset: 0 })
            }
            widgetId={`pagination-options-menu-bottom`}
            variant={PaginationVariant.bottom}
          />
        </div>
      )}
    </>
  );
};

ClustersListTable.propTypes = {
  query: PropTypes.object.isRequired,
};

export { ClustersListTable };
