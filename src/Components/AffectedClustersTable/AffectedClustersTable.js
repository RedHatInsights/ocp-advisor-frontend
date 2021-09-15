import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

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
import { updateAffectedClustersFilters } from '../../Services/Filters';

const AffectedClustersTable = ({ affectedClusters }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const filters = useSelector(({ filters }) => filters.affectedClustersState);
  const perPage = Number(filters.limit);
  const page = filters.offset / filters.limit + 1;
  const setFilters = (filters) =>
    dispatch(updateAffectedClustersFilters(filters));
  const {
    isError,
    isUninitialized,
    isLoading,
    isFetching,
    isSuccess,
    data: { data: rows = [] } = {},
  } = affectedClusters;
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [chips, setChips] = useState([]);

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
    setFilters(newFilters);
  };

  const onNameFilterChange = (value) => {
    const newFilters = { ...filters, text: value, offset: 0 };
    setFilters(newFilters);
  };

  const filterConfig = {
    items: [
      {
        label: 'Name',
        type: conditionalFilterType.text,
        filterValues: {
          key: 'name-filter',
          onChange: (_e, value) => onNameFilterChange(value),
          value: filters.text,
        },
      },
    ],
    isDisabled: isError || (rows && rows.length === 0),
  };

  const onSort = (_e, index, direction) => {
    setFilters({ ...filters, sortIndex: index, sortDirection: direction });
  };

  const onSetPage = (_e, pageNumber) => {
    const newOffset = pageNumber * filters.limit - filters.limit;
    setFilters({ ...filters, offset: newOffset });
  };

  const onSetPerPage = (_e, perPage) => {
    setFilters({ ...filters, limit: perPage });
  };

  // constructs array of rows (from the initial data) checking currently applied filters
  const buildFilteredRows = (allRows, filters) => {
    const rows = allRows;
    return rows
      .filter((row) => {
        // further filters conditions will be added soon
        return row.includes(filters.text);
      })
      .sort((a, b) => {
        if (filters.sortDirection === 'asc') {
          return a.localeCompare(b);
        }
        return b.localeCompare(a);
      });
  };

  const buildDisplayedRows = (rows) => {
    return rows.slice(perPage * (page - 1), perPage * (page - 1) + perPage);
  };

  useEffect(() => {
    const newFilteredRows = buildFilteredRows(rows, filters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows);
    const newChips = updateNameChip(chips, filters.text);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
    setChips(newChips);
  }, [affectedClusters, filters]);

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
          filters: chips,
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
              index: filters.sortIndex,
              direction: filters.sortDirection,
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
