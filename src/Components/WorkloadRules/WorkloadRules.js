import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import {
  WORKLOADS_RULES_FILTER_CONFIG,
  WORKLOAD_RULES_COLUMNS,
  WORKLOAD_RULES_FILTER_CATEGORIES,
} from '../../AppConstants';
import PropTypes from 'prop-types';
import Loading from '../Loading/Loading';
import { ErrorState } from '../MessageState/EmptyStates';
// import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat/DateFormat';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import ExpandedRulesDetails from '../ExpandedRulesDetails.js/ExpandedRulesDetails';
import { useDispatch, useSelector } from 'react-redux';
import {
  WORKLOADS_RECS_TABLE_INITIAL_STATE,
  resetFilters,
  updateWorkloadsRecsListFilters,
} from '../../Services/Filters';
import {
  addFilterParam as _addFilterParam,
  passFilterWorkloadsRecs,
  removeFilterParam as _removeFilterParam,
} from '../Common/Tables';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import {
  filtersAreApplied,
  pruneWorkloadsRulesFilters,
} from '../../Utilities/Workloads';

const WorkloadRules = ({ workload }) => {
  const dispatch = useDispatch();
  const { isError, isUninitialized, isFetching, isSuccess, data } = workload;
  const recommendations = data?.recommendations || [];
  const errorState = isError;
  const successState = isSuccess;
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [rowsFiltered, setRowsFiltered] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [expandFirst, setExpandFirst] = useState(true);
  const loadingState = isUninitialized || isFetching || !rowsFiltered;
  //FILTERS
  const filters = useSelector(({ filters }) => filters.workloadsRecsListState);
  const updateFilters = (payload) =>
    dispatch(updateWorkloadsRecsListFilters(payload));
  const addFilterParam = (param, values) => {
    setExpandFirst(false);
    return _addFilterParam(filters, updateFilters, param, values);
  };
  const removeFilterParam = (param) =>
    _removeFilterParam(filters, updateFilters, param);

  useEffect(() => {
    setFilteredRows(buildFilteredRows(recommendations, filters));
  }, [data, filters]);

  useEffect(() => {
    setDisplayedRows(
      buildDisplayedRows(filteredRows, filters.sortIndex, filters.sortDirection)
    );
    setFiltersApplied(filtersAreApplied(filters));
    setRowsFiltered(true);
  }, [filteredRows]);

  const filterConfigItems = WORKLOADS_RULES_FILTER_CONFIG(
    filters,
    addFilterParam
  );

  const buildDisplayedRows = (filteredRows, sortIndex, sortDirection) => {
    void sortIndex;
    void sortDirection;

    return filteredRows.flatMap((row, index) => {
      const updatedRow = [...row];
      if (expandFirst && index === 0) {
        row[0].isOpen = true;
      }
      row[1].parent = index * 2;
      return updatedRow;
    });
  };

  const handleOnCollapse = (_e, rowId, isOpen) => {
    if (rowId === undefined) {
      // if undefined, all rows are affected
      setIsAllExpanded(isOpen);
      setDisplayedRows(
        displayedRows.map((row) => ({
          ...row,
          // Don't show expand button for expanded content
          ...(Object.hasOwn(row, 'parent') ? null : { isOpen }),
        }))
      );
    } else {
      setDisplayedRows(
        displayedRows.map((row, index) =>
          index === rowId ? { ...row, isOpen } : row
        )
      );
    }
  };

  const buildFilteredRows = (allRows, filters) => {
    setRowsFiltered(false);
    const noFilters = filtersAreApplied(filters);
    return allRows
      .filter((recs) =>
        noFilters ? passFilterWorkloadsRecs(recs, filters) : true
      )
      .map((value, key) => [
        {
          rule: value,
          isOpen: isAllExpanded,
          cells: [
            {
              title: value.details,
            },
            {
              title: (
                <div key={key}>
                  <InsightsLabel value={4} rest={{ isCompact: true }} />
                </div>
              ),
            },
            {
              title: value.objects.length,
            },
            {
              title: (
                <div key={key}>
                  <DateFormat date={value.modified} type="relative" />
                </div>
              ),
            },
          ],
        },
        {
          cells: [
            {
              title: (
                <ExpandedRulesDetails
                  extra_data={value.extra_data}
                  more_info={value.more_info}
                  resolution={value.resolution}
                  objects={value.objects}
                />
              ),
            },
          ],
        },
      ]);
  };

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sortIndex;
    delete localFilters.sortDirection;
    return pruneWorkloadsRulesFilters(
      localFilters,
      WORKLOAD_RULES_FILTER_CATEGORIES
    );
  };

  const activeFiltersConfig = {
    showDeleteButton: filtersApplied ? true : false,
    deleteTitle: 'Reset filters',
    filters: buildFilterChips(),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        resetFilters(
          filters,
          WORKLOADS_RECS_TABLE_INITIAL_STATE,
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

  return (
    <div id="workload-recs-list-table">
      <PrimaryToolbar
        filterConfig={{
          items: filterConfigItems,
          isDisabled:
            loadingState || errorState || recommendations.length === 0,
        }}
        pagination={
          <span className="pf-u-font-weight-bold">
            {recommendations?.length === 1
              ? `${recommendations.length} Recommendation`
              : `${recommendations.length} Recommendations`}
          </span>
        }
        activeFiltersConfig={
          loadingState || errorState || recommendations.length === 0
            ? undefined
            : activeFiltersConfig
        }
      />
      <Table
        aria-label={'Workload recommendations table'}
        ouiaId="workload-recommendations"
        cells={WORKLOAD_RULES_COLUMNS}
        ouiaSafe={!loadingState}
        onCollapse={handleOnCollapse} // TODO: set undefined when there is an empty state
        rows={
          errorState || loadingState ? (
            [
              {
                fullWidth: true,
                cells: [
                  {
                    props: {
                      colSpan: WORKLOAD_RULES_COLUMNS.length + 1,
                    },
                    title: <Loading />,
                    // TODO: Empty state
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
        variant={TableVariant.compact}
        isStickyHeader
        canCollapseAll
      >
        <TableHeader />
        <TableBody />
      </Table>
    </div>
  );
};

export default WorkloadRules;

WorkloadRules.propTypes = {
  workload: PropTypes.shape({
    isUninitialized: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    isSuccess: PropTypes.bool.isRequired,
    error: PropTypes.object,
    data: PropTypes.shape({
      namespace: PropTypes.shape({
        uuid: PropTypes.string,
        name: PropTypes.string,
      }),
      cluster: PropTypes.shape({
        uuid: PropTypes.string,
        display_name: PropTypes.string,
      }),
      status: PropTypes.string,
      recommendations: PropTypes.arrayOf(
        PropTypes.shape({
          check: PropTypes.string,
          description: PropTypes.string,
          objects: PropTypes.arrayOf(
            PropTypes.shape({
              kind: PropTypes.string,
              uid: PropTypes.string,
            })
          ),
          remediation: PropTypes.string,
        })
      ),
    }),
  }),
};
