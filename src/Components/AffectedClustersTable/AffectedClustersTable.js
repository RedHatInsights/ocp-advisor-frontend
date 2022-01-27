import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter/conditionalFilterConstants';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { EmptyTable } from '@redhat-cloud-services/frontend-components/EmptyTable';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Card, CardBody } from '@patternfly/react-core/dist/js/components/Card';
import { Table } from '@patternfly/react-table/dist/js/components/Table/Table';
import { TableBody } from '@patternfly/react-table/dist/js/components/Table/Body';
import { TableHeader } from '@patternfly/react-table/dist/js/components/Table/Header';
import { Bullseye } from '@patternfly/react-core/dist/js/layouts/Bullseye';
import { Tooltip } from '@patternfly/react-core/dist/js/components/Tooltip';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/js/components/Pagination/Pagination';

import {
  ErrorState,
  NoAffectedClusters,
  NoMatchingClusters,
} from '../MessageState/EmptyStates';
import {
  AFFECTED_CLUSTERS_COLUMNS,
  AFFECTED_CLUSTERS_LAST_SEEN,
  AFFECTED_CLUSTERS_NAME_CELL,
} from '../../AppConstants';
import Loading from '../Loading/Loading';
import { updateAffectedClustersFilters } from '../../Services/Filters';
import messages from '../../Messages';
import DisableRule from '../Modals/DisableRule';

const AffectedClustersTable = ({ query, rule, afterDisableFn }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [chips, setChips] = useState([]);
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
  const rows = data.enabled;
  const filters = useSelector(({ filters }) => filters.affectedClustersState);
  const perPage = filters.limit;
  const page = filters.offset / filters.limit + 1;
  const allSelected = selected.length === filteredRows.length;

  const updateFilters = (filters) =>
    dispatch(updateAffectedClustersFilters(filters));

  const updateNameChip = (chips, newValue) => {
    const newChips = chips;
    const nameCategoryIndex = newChips.findIndex(
      (chip) => chip.category === 'Name'
    );
    if (newValue === '') {
      newChips.splice(nameCategoryIndex);
    } else {
      if (nameCategoryIndex === -1) {
        newChips.push({ category: 'Name', chips: [{ name: newValue }] });
      } else {
        newChips[nameCategoryIndex] = {
          category: 'Name',
          chips: [{ name: newValue }],
        };
      }
    }
    return newChips;
  };

  const onChipDelete = () => {
    // right now, only designed to treat the Name (text) filter
    const newFilters = { ...filters, text: '' };
    updateFilters(newFilters);
  };

  const onNameFilterChange = (value) => {
    const newFilters = { ...filters, text: value, offset: 0 };
    updateFilters(newFilters);
  };

  const filterConfig = {
    items: [
      {
        label: 'Name',
        placeholder: 'Filter by name',
        type: conditionalFilterType.text,
        filterValues: {
          id: 'name-filter',
          key: 'name-filter',
          onChange: (_e, value) => onNameFilterChange(value),
          value: filters.text,
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
    const rows = allRows.map((r) => ({
      id: r.cluster,
      cells: [r?.cluster_name || r.cluster],
      last_checked_at: r?.last_checked_at,
    }));
    if (filters.sortIndex !== -1) {
      return rows
        .filter((row) => {
          return row?.cells[0]
            .toLowerCase()
            .includes(filters.text.toLowerCase());
        })
        .sort((a, b) => {
          let fst, snd;
          const d = filters.sortDirection === 'asc' ? 1 : -1;
          switch (filters.sortIndex) {
            case AFFECTED_CLUSTERS_NAME_CELL:
              if (filters.sortDirection === 'asc') {
                return a?.cells[0].localeCompare(b?.cells[0]);
              }
              return b?.cells[0].localeCompare(a?.cells[0]);
            case AFFECTED_CLUSTERS_LAST_SEEN:
              if (a.last_checked_at === '' || undefined) {
                fst = new Date(a.last_checked_at || 0);
                snd = new Date(b.last_checked_at || 0);
                return fst > snd ? d : snd > fst ? -d : 0;
              }
          }
        });
    } else
      return rows.slice(
        filters.limit * (page - 1),
        filters.limit * (page - 1) + filters.limit
      );
  };

  const buildDisplayedRows = (rows) => {
    return rows
      .slice(perPage * (page - 1), perPage * (page - 1) + perPage)
      .map((r) => ({
        ...r,
        cells: [
          <span key={r.id}>
            <Link to={`/clusters/${r.id}`}>{r.cells[0]}</Link>
          </span>,
          <span key={r.id}>
            {r.last_checked_at ? (
              <DateFormat
                extraTitle={`${intl.formatMessage(messages.lastSeen)}: `}
                date={r.last_checked_at}
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
    const newChips = updateNameChip(chips, filters.text);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
    setChips(newChips);
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
          hosts={selected}
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
                filters: chips,
                onDelete: onChipDelete,
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
        rows={displayedRows}
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
            onClick: (event, rowIndex) => {
              console.log(filteredRows[rowIndex]);
              return handleModalToggle(true, filteredRows[rowIndex].id);
            },
          },
        ]}
      >
        <TableHeader />
        {(isUninitialized || isFetching) && <Loading />}
        {isError && (
          <Card id="error-state-message" ouiaId="error-state">
            <CardBody>
              <ErrorState />
            </CardBody>
          </Card>
        )}
        {isSuccess && rows.length === 0 && (
          <Card id="empty-state-message" ouiaId="empty-state">
            <CardBody>
              <NoAffectedClusters />
            </CardBody>
          </Card>
        )}
        {isSuccess &&
          rows.length > 0 &&
          (filteredRows.length > 0 ? (
            <TableBody />
          ) : (
            <EmptyTable>
              <Bullseye>
                <NoMatchingClusters />
              </Bullseye>
            </EmptyTable>
          ))}
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
    data: PropTypes.array,
  }),
  rule: PropTypes.object,
  afterDisableFn: PropTypes.func,
};

export { AffectedClustersTable };
