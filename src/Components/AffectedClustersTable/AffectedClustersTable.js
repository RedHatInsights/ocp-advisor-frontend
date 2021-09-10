import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter/conditionalFilterConstants';

import { global_success_color_100 as globalSuccessColor100 } from '@patternfly/react-tokens/dist/js/global_success_color_100';
import CheckCircleIcon from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { Card, CardBody } from '@patternfly/react-core/dist/js/components/Card';
import {
  TableComposable,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';

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

  const onChipDelete = (_e, chipsToDelete) => {
    console.log(activeChips);
    console.log(chipsToDelete);
    const newActiveChips = activeChips;
    newActiveChips.filter((c) => !chipsToDelete.includes(c));
    setActiveChips(newActiveChips);
  };

  const onNameFilterChange = (value) => {
    const newActiveFilters = { ...activeFilters, name: value };
    const newFilteredRows = buildFilteredRows(rows, newActiveFilters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows, page, perPage);
    const newActiveChips = updateNameChip(activeChips, value);
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
      {
        label: 'Version',
        type: conditionalFilterType.checkbox,
        filterValues: {
          value: 'all',
          items: [{ label: 'All', value: 'all' }],
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
    console.log(newPage);
    setDisplayedRows(buildDisplayedRows(filteredRows, newPage, perPage));
    setPage(newPage);
  };

  const onSetPerPage = (_e, newPerPage) => {
    setDisplayedRows(buildDisplayedRows(filteredRows, page, newPerPage));
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
      {(isUninitialized || isLoading || isFetching) && <Loading />}
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
      {isSuccess && data?.data && data?.data.length > 0 ? (
        <TableComposable
          aria-label="Table of affected clusters"
          ouiaId="affectedClustersTable"
          variant="compact"
        >
          <Thead>
            <Tr>
              <Th
                sort={{
                  columnIndex: 0,
                  sortBy: {
                    index: activeSortIndex,
                    direction: activeSortDirection,
                  },
                  onSort,
                }}
              >
                Name
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayedRows.map((c) => (
              <Tr key={c}>
                <Td>
                  <Link to={`/clusters/${c}`}>{c}</Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      ) : (
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
    </React.Fragment>
  );
};

AffectedClustersTable.propTypes = {
  affectedClusters: PropTypes.array,
};

export { AffectedClustersTable };
