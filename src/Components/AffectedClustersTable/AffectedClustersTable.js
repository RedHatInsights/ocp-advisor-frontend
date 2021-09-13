import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter/conditionalFilterConstants';
import { EmptyTable } from '@redhat-cloud-services/frontend-components/EmptyTable';
import { TableToolbar } from '@redhat-cloud-services/frontend-components/TableToolbar';

import { global_success_color_100 as globalSuccessColor100 } from '@patternfly/react-tokens/dist/js/global_success_color_100';
import { global_danger_color_100 as globalDangerColor100 } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { Card, CardBody } from '@patternfly/react-core/dist/js/components/Card';
import { sortable } from '@patternfly/react-table/dist/js/components/Table/utils/decorators/sortable';
import { Table } from '@patternfly/react-table/dist/js/components/Table/Table';
import { TableBody } from '@patternfly/react-table/dist/js/components/Table/Body';
import { TableHeader } from '@patternfly/react-table/dist/js/components/Table/Header';
import { Bullseye } from '@patternfly/react-core/dist/js/layouts/Bullseye';
import {
  EmptyState,
  EmptyStateVariant,
} from '@patternfly/react-core/dist/js/components/EmptyState/EmptyState';
import { EmptyStateBody } from '@patternfly/react-core/dist/js/components/EmptyState';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import { Title } from '@patternfly/react-core/dist/js/components/Title';

import messages from '../../Messages';
import MessageState from '../MessageState/MessageState';
import Loading from '../Loading/Loading';

const AffectedClustersTable = ({ affectedClusters }) => {
  const intl = useIntl();
  const { isError, isUninitialized, isLoading, isFetching, isSuccess, data } =
    affectedClusters;
  const rows = data?.data || [];
  const [activeFilters, setActiveFilters] = useState({ name: '' });
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [activeSortIndex, setActiveSortIndex] = useState(-1);
  const [activeSortDirection, setActiveSortDirection] = useState(null);
  const [activeChips, setActiveChips] = useState([]);

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

  // right now, only designed to treat the Name filter
  const onChipDelete = () => {
    const newActiveFilters = { ...activeFilters, name: '' };
    const newFilteredRows = buildFilteredRows(rows, newActiveFilters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows, page, perPage);
    setActiveChips([]);
    setActiveFilters(newActiveFilters);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
  };

  const onNameFilterChange = (value) => {
    const newActiveFilters = { ...activeFilters, name: value };
    const newFilteredRows = buildFilteredRows(rows, newActiveFilters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows, 1, perPage);
    const newActiveChips = updateNameChip(activeChips, value);
    setPage(1);
    setActiveChips(newActiveChips);
    setActiveFilters(newActiveFilters);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
  };

  const filterConfig = {
    items: [
      {
        label: 'Name',
        type: conditionalFilterType.text,
        filterValues: {
          key: 'name-filter',
          onChange: (_e, value) => onNameFilterChange(value),
          value: activeFilters.name,
        },
      },
    ],
    isDisabled: isError || (data?.data && data?.data.length === 0),
  };

  const onSort = (_e, index, direction) => {
    setActiveSortIndex(index);
    setActiveSortDirection(direction);
    // sorts the rows
    const updatedRows = filteredRows.concat().sort((a, b) => {
      if (direction === 'asc') {
        return a.localeCompare(b);
      }
      return b.localeCompare(a);
    });
    setFilteredRows(updatedRows);
    setDisplayedRows(buildDisplayedRows(updatedRows, page, perPage));
  };

  const onSetPage = (_e, newPage) => {
    setDisplayedRows(buildDisplayedRows(filteredRows, newPage, perPage));
    setPage(newPage);
  };

  const onSetPerPage = (_e, newPerPage) => {
    setDisplayedRows(buildDisplayedRows(filteredRows, 1, newPerPage));
    setPage(1);
    setPerPage(newPerPage);
  };

  // constructs array of rows (from the initial data) checking currently applied filters
  const buildFilteredRows = (allRows, filters) => {
    const rows = allRows;
    return rows.filter((row) => {
      return Object.entries(filters).every((filter) => {
        if (filter[0] === 'name') {
          const filterNameValue = filter[1];
          return row.includes(filterNameValue);
        }
        return false;
        // further filters will be added soon
      });
    });
  };

  const buildDisplayedRows = (rows, page, perPage) => {
    return rows.slice(perPage * (page - 1), perPage * (page - 1) + perPage);
  };

  useEffect(() => {
    const newFilteredRows = buildFilteredRows(rows, activeFilters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows, page, perPage);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
  }, [affectedClusters]);

  return (
    <React.Fragment>
      <PrimaryToolbar
        filterConfig={filterConfig}
        pagination={{
          itemCount: filteredRows.length,
          page,
          perPage,
          onSetPage: onSetPage,
          onPerPageSelect: onSetPerPage,
        }}
        activeFiltersConfig={{
          filters: activeChips,
          onDelete: onChipDelete,
        }}
      />
      {(isUninitialized || isLoading || isFetching) && <Loading />}
      {isError && (
        <Card>
          <CardBody>
            <MessageState
              icon={ExclamationCircleIcon}
              iconStyle={{ color: globalDangerColor100.value }}
              title={intl.formatMessage(messages.noClustersError)}
              text={intl.formatMessage(messages.noClustersErrorDesc)}
            />
          </CardBody>
        </Card>
      )}
      {isSuccess && rows.length === 0 && (
        <Card>
          <CardBody>
            <MessageState
              icon={CheckCircleIcon}
              iconStyle={{ color: globalSuccessColor100.value }}
              title={intl.formatMessage(messages.noClusters)}
              text={intl.formatMessage(messages.noClustersBody)}
            />
          </CardBody>
        </Card>
      )}
      {isSuccess &&
        rows.length > 0 &&
        (filteredRows.length > 0 ? (
          <Table
            aria-label="Table of affected clusters"
            ouiaId="affectedClustersTable"
            variant="compact"
            cells={[{ title: 'Name', transforms: [sortable] }]}
            rows={displayedRows.map((c) => ({
              cells: [
                <span key={c}>
                  <Link to={`/clusters/${c}`}>{c}</Link>
                </span>,
              ],
            }))}
            sortBy={{
              index: activeSortIndex,
              direction: activeSortDirection,
            }}
            onSort={onSort}
          >
            <TableHeader />
            <TableBody />
          </Table>
        ) : (
          <EmptyTable>
            <Bullseye>
              <EmptyState variant={EmptyStateVariant.full}>
                <Title headingLevel="h5" size="lg">
                  {intl.formatMessage(messages.noMatchingClusters)}
                </Title>
                <EmptyStateBody>
                  {intl.formatMessage(messages.noMatchingClustersDesc)}
                </EmptyStateBody>
              </EmptyState>
            </Bullseye>
          </EmptyTable>
        ))}
      <TableToolbar isFooter className="ins-c-inventory__table--toolbar">
        <Pagination
          variant={PaginationVariant.bottom}
          itemCount={filteredRows.length}
          page={page}
          perPage={perPage}
          onSetPage={onSetPage}
          onPerPageSelect={onSetPerPage}
          onPageInput={onSetPage}
        />
      </TableToolbar>
    </React.Fragment>
  );
};

AffectedClustersTable.propTypes = {
  affectedClusters: PropTypes.array,
};

export { AffectedClustersTable };
