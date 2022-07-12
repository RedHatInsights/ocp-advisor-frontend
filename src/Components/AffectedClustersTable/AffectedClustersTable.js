import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { valid } from 'semver';
import uniqBy from 'lodash/uniqBy';

import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter/conditionalFilterConstants';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Tooltip, Pagination } from '@patternfly/react-core';
import { PaginationVariant } from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import { Table, TableHeader, TableBody } from '@patternfly/react-table';

import {
  ErrorState,
  NoAffectedClusters,
  NoMatchingClusters,
} from '../MessageState/EmptyStates';
import {
  AFFECTED_CLUSTERS_COLUMNS,
  AFFECTED_CLUSTERS_IMPACTED_CELL,
  AFFECTED_CLUSTERS_LAST_SEEN_CELL,
  AFFECTED_CLUSTERS_NAME_CELL,
  AFFECTED_CLUSTERS_VERSION_CELL,
  FILTER_CATEGORIES,
} from '../../AppConstants';
import Loading from '../Loading/Loading';
import {
  AFFECTED_CLUSTERS_INITIAL_STATE,
  updateAffectedClustersFilters,
} from '../../Services/Filters';
import messages from '../../Messages';
import DisableRule from '../Modals/DisableRule';
import {
  buildFilterChips,
  compareSemVer,
  removeFilterParam as _removeFilterParam,
  addFilterParam as _addFilterParam,
} from '../Common/Tables';

const AffectedClustersTable = ({ query, rule, afterDisableFn }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const [host, setHost] = useState(undefined);

  const {
    isError,
    isUninitialized,
    isFetching,
    isSuccess,
    /* the response contains two lists: `disabled` has clusters
      for which the rec is disabled (acked), and `enable` contains
       clusters that are affected by the rec */
    data = { disabled: [], enabled: [] },
  } = query;
  const rows = data?.enabled || [];
  const filters = useSelector(({ filters }) => filters.affectedClustersState);
  const perPage = filters.limit;
  const page = filters.offset / filters.limit + 1;
  const allSelected =
    filteredRows.length !== 0 && selected.length === filteredRows.length;
  const loadingState = isUninitialized || isFetching;
  const errorState = isError;
  const successState = isSuccess;
  const noInput = successState && rows.length === 0;
  const noMatch = rows.length > 0 && filteredRows.length === 0;

  const updateFilters = (filters) =>
    dispatch(updateAffectedClustersFilters(filters));

  const removeFilterParam = (param) =>
    _removeFilterParam(filters, updateFilters, param);

  const addFilterParam = (param, values) =>
    _addFilterParam(filters, updateFilters, param, values);

  const filterConfig = {
    items: [
      {
        label: intl.formatMessage(messages.name),
        placeholder: intl.formatMessage(messages.filterByName),
        type: conditionalFilterType.text,
        filterValues: {
          id: 'name-filter',
          key: 'name-filter',
          onChange: (event, value) => addFilterParam('text', value),
          value: filters.text,
        },
      },
      {
        label: intl.formatMessage(messages.version),
        placeholder: intl.formatMessage(messages.filterByVersion),
        type: conditionalFilterType.checkbox,
        filterValues: {
          id: 'version-filter',
          key: 'version-filter',
          onChange: (event, value) => addFilterParam('version', value),
          value: filters.version,
          items: uniqBy(
            rows
              .filter((r) => r.meta.cluster_version !== '')
              .map((r) => ({
                value: r.meta.cluster_version,
              }))
              .sort((a, b) => compareSemVer(a.value, b.value, 1))
              .reverse(), // should start from the latest version
            'value'
          ),
        },
      },
    ],
    isDisabled: isError || (rows && rows.length === 0),
  };

  const onSort = (_e, index, direction) => {
    updateFilters({ ...filters, sortIndex: index, sortDirection: direction });
  };

  const onSetPage = (_e, pageNumber) => {
    const newOffset = pageNumber * filters.limit - filters.limit;
    updateFilters({ ...filters, offset: newOffset });
  };

  const onSetPerPage = (_e, perPage) => {
    updateFilters({ ...filters, limit: perPage });
  };

  // constructs array of rows (from the initial data) checking currently applied filters
  const buildFilteredRows = (allRows, filters) => {
    const rows = allRows.map((r) => {
      if (r.meta.cluster_version !== '' && !valid(r.meta.cluster_version)) {
        console.error(
          `Cluster version ${r.meta.cluster_version} has invalid format!`
        );
      }

      return {
        id: r.cluster,
        cells: [
          '',
          r.cluster_name || r.cluster,
          r.meta.cluster_version,
          r.last_checked_at,
          r.impacted,
        ],
      };
    });
    return rows
      .filter((row) => {
        return (
          row?.cells[AFFECTED_CLUSTERS_NAME_CELL].toLowerCase().includes(
            filters.text.toLowerCase()
          ) &&
          (filters.version.length === 0 ||
            filters.version.includes(row.cells[AFFECTED_CLUSTERS_VERSION_CELL]))
        );
      })
      .sort((a, b) => {
        let fst, snd;
        const d = filters.sortDirection === 'asc' ? 1 : -1;
        switch (filters.sortIndex) {
          case AFFECTED_CLUSTERS_NAME_CELL:
            return (
              d *
              a?.cells[AFFECTED_CLUSTERS_NAME_CELL].localeCompare(
                b?.cells[AFFECTED_CLUSTERS_NAME_CELL]
              )
            );
          case AFFECTED_CLUSTERS_VERSION_CELL:
            return compareSemVer(
              a.cells[AFFECTED_CLUSTERS_VERSION_CELL] || '0.0.0',
              b.cells[AFFECTED_CLUSTERS_VERSION_CELL] || '0.0.0',
              d
            );
          case AFFECTED_CLUSTERS_LAST_SEEN_CELL:
            fst = new Date(a.cells[AFFECTED_CLUSTERS_LAST_SEEN_CELL] || 0);
            snd = new Date(b.cells[AFFECTED_CLUSTERS_LAST_SEEN_CELL] || 0);
            return fst > snd ? d : snd > fst ? -d : 0;
          case AFFECTED_CLUSTERS_IMPACTED_CELL:
            fst = new Date(a.cells[AFFECTED_CLUSTERS_IMPACTED_CELL] || 0);
            snd = new Date(b.cells[AFFECTED_CLUSTERS_IMPACTED_CELL] || 0);
            return fst > snd ? d : snd > fst ? -d : 0;
        }
      });
  };

  const buildDisplayedRows = (rows) => {
    return rows
      .slice(perPage * (page - 1), perPage * (page - 1) + perPage)
      .map((r) => ({
        ...r,
        cells: [
          <span key={r.id}>
            <Link to={`/clusters/${r.id}?first=${rule.rule_id}`}>
              {r.cells[AFFECTED_CLUSTERS_NAME_CELL]}
            </Link>
          </span>,
          <span key={r.id}>
            {r.cells[AFFECTED_CLUSTERS_VERSION_CELL] ||
              intl.formatMessage(messages.nA)}
          </span>,
          <span key={r.id}>
            {r.cells[AFFECTED_CLUSTERS_LAST_SEEN_CELL] ? (
              <DateFormat
                extraTitle={`${intl.formatMessage(messages.lastSeen)}: `}
                date={r.cells[AFFECTED_CLUSTERS_LAST_SEEN_CELL]}
                variant="relative"
              />
            ) : (
              <Tooltip
                key={r.id}
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
          <span key={r.id}>
            {r.cells[AFFECTED_CLUSTERS_IMPACTED_CELL] ? (
              <DateFormat
                extraTitle={`${intl.formatMessage(messages.impacted)}: `}
                date={r.cells[AFFECTED_CLUSTERS_IMPACTED_CELL]}
                variant="relative"
              />
            ) : (
              <Tooltip
                key={r.id}
                content={
                  <span>
                    {intl.formatMessage(messages.impacted) + ': '}
                    {intl.formatMessage(messages.nA)}
                  </span>
                }
              >
                <span>{intl.formatMessage(messages.nA)}</span>
              </Tooltip>
            )}
          </span>,
        ],
      }));
  };

  // if rowId === -1, then select all rows
  const onSelect = (event, isSelected, rowId) => {
    let rows;
    rowId === -1
      ? (rows = filteredRows.map((r) => ({ ...r, selected: isSelected })))
      : (rows = filteredRows.map((r, i) => ({
          ...r,
          selected: i === rowId ? isSelected : r.selected,
        })));
    setSelected(rows.filter((r) => r.selected));
    setFilteredRows(rows);
    setDisplayedRows(buildDisplayedRows(rows));
  };

  useEffect(() => {
    const newFilteredRows = buildFilteredRows(rows, filters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
  }, [query, filters]);

  const handleModalToggle = (disableRuleModalOpen, host = undefined) => {
    setDisableRuleModalOpen(disableRuleModalOpen);
    setHost(host);
  };

  return (
    <div id="affected-list-table">
      {disableRuleModalOpen && (
        <DisableRule
          handleModalToggle={handleModalToggle}
          isModalOpen={disableRuleModalOpen}
          rule={rule}
          afterFn={afterDisableFn}
          hosts={host !== undefined ? [] : selected}
          host={host}
        />
      )}
      <PrimaryToolbar
        filterConfig={filterConfig}
        pagination={{
          itemCount: filteredRows.length,
          page,
          perPage,
          onSetPage: onSetPage,
          onPerPageSelect: onSetPerPage,
          ouiaId: 'pager',
        }}
        activeFiltersConfig={
          isError || (rows && rows.length === 0)
            ? undefined
            : {
                filters: buildFilterChips(filters, FILTER_CATEGORIES),
                deleteTitle: intl.formatMessage(messages.resetFilters),
                onDelete: (event, itemsToRemove, isAll) => {
                  if (isAll) {
                    updateFilters(AFFECTED_CLUSTERS_INITIAL_STATE);
                  } else {
                    itemsToRemove.map((item) => {
                      const newFilter = {
                        [item.urlParam]: Array.isArray(filters[item.urlParam])
                          ? filters[item.urlParam].filter(
                              (value) =>
                                String(value) !== String(item.chips[0].value)
                            )
                          : '',
                      };
                      newFilter[item.urlParam].length > 0
                        ? updateFilters({ ...filters, ...newFilter })
                        : removeFilterParam(item.urlParam);
                    });
                  }
                },
              }
        }
        bulkSelect={{
          count: selected.length,
          items: [
            {
              title: intl.formatMessage(messages.selectNone),
              onClick: (event) => onSelect(event, false, -1),
            },
            {
              title: intl.formatMessage(messages.selectAll, {
                items: filteredRows?.length || 0,
              }),
              onClick: (event) => onSelect(event, true, -1),
            },
          ],
          checked: allSelected,
          onSelect: (event) =>
            allSelected
              ? onSelect(event, false, -1)
              : onSelect(event, true, -1),
          ouiaId: 'clusters-selector',
        }}
        actionsConfig={{
          actions: [
            '',
            {
              label: intl.formatMessage(messages.disableRuleForClusters),
              props: { isDisabled: selected.length === 0 },
              onClick: () => handleModalToggle(true),
            },
          ],
        }}
      />
      <Table
        aria-label="Table of affected clusters"
        ouiaId="clusters"
        variant="compact"
        cells={AFFECTED_CLUSTERS_COLUMNS}
        rows={
          errorState || loadingState || noMatch || noInput ? (
            [
              {
                fullWidth: true,
                cells: [
                  {
                    props: {
                      colSpan: AFFECTED_CLUSTERS_COLUMNS.length + 1,
                    },
                    title: errorState ? (
                      <ErrorState />
                    ) : loadingState ? (
                      <Loading />
                    ) : noInput ? (
                      <NoAffectedClusters />
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
        canSelectAll={false}
        onSelect={displayedRows?.length > 0 ? onSelect : undefined}
        actions={[
          {
            title: 'Disable recommendation for cluster',
            onClick: (event, rowIndex) =>
              handleModalToggle(true, filteredRows[rowIndex].id),
          },
        ]}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <TableToolbar isFooter className="ins-c-inventory__table--toolbar">
        <Pagination
          variant={PaginationVariant.bottom}
          itemCount={filteredRows.length}
          page={page}
          perPage={perPage}
          onSetPage={onSetPage}
          onPerPageSelect={onSetPerPage}
          onPageInput={onSetPage}
          ouiaId="pager"
        />
      </TableToolbar>
    </div>
  );
};

AffectedClustersTable.propTypes = {
  query: PropTypes.shape({
    isError: PropTypes.bool.isRequired,
    isUninitialized: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    isSuccess: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      enabled: PropTypes.array,
      disabled: PropTypes.array,
    }),
  }),
  rule: PropTypes.object,
  afterDisableFn: PropTypes.func,
};

export { AffectedClustersTable };
