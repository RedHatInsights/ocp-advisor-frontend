import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { compare, valid } from 'semver';

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
  AFFECTED_CLUSTERS_LAST_SEEN_CELL,
  AFFECTED_CLUSTERS_NAME_CELL,
  AFFECTED_CLUSTERS_VERSION_CELL,
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
        ],
      };
    });
    return rows
      .filter((row) => {
        return row?.cells[AFFECTED_CLUSTERS_NAME_CELL].toLowerCase().includes(
          filters.text.toLowerCase()
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
            return (
              d *
              compare(
                a.cells[AFFECTED_CLUSTERS_VERSION_CELL] || '0.0.0',
                b.cells[AFFECTED_CLUSTERS_VERSION_CELL] || '0.0.0'
              )
            );
          case AFFECTED_CLUSTERS_LAST_SEEN_CELL:
            fst = new Date(a.cells[AFFECTED_CLUSTERS_LAST_SEEN_CELL] || 0);
            snd = new Date(b.cells[AFFECTED_CLUSTERS_LAST_SEEN_CELL] || 0);
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
                deleteTitle: intl.formatMessage(messages.resetFilters),
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
            onClick: (event, rowIndex) =>
              handleModalToggle(true, filteredRows[rowIndex].id),
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
