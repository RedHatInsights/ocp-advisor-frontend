import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import {
  WORKLOAD_RULES_COLUMNS,
  FILTER_CATEGORIES as FC,
} from '../../AppConstants';
import PropTypes from 'prop-types';
import Loading from '../Loading/Loading';
import { ErrorState } from '../MessageState/EmptyStates';
// import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat/DateFormat';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';

const WorkloadRules = ({ workload }) => {
  const { isError, isUninitialized, isFetching, isSuccess, data, error } =
    workload;
  void error;
  const recommendations = data?.recommendations || [];
  const errorState = isError;
  const successState = isSuccess;
  const [filters, setFilters] = useState([]);
  void setFilters;
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [rowsFiltered, setRowsFiltered] = useState(false);
  const loadingState = isUninitialized || isFetching || !rowsFiltered;

  useEffect(() => {
    setFilteredRows(buildFilteredRows(recommendations, filters));
  }, [data, filters]);

  useEffect(() => {
    setDisplayedRows(
      buildDisplayedRows(filteredRows, filters.sortIndex, filters.sortDirection)
    );
    setRowsFiltered(true);
  }, [filteredRows]);

  const filterConfigItems = [
    {
      label: 'description',
      filterValues: {
        key: 'text-filter',
        // value: filters.text,
      },
    },
    {
      label: FC.total_risk.title,
      type: FC.total_risk.type,
      id: FC.total_risk.urlParam,
      value: `checkbox-${FC.total_risk.urlParam}`,
      filterValues: {
        key: `${FC.total_risk.urlParam}-filter`,
        // onChange: (_e, values) =>
        //   addFilterParam(FILTER_CATEGORIES.total_risk.urlParam, values),
        value: filters.total_risk,
        items: FC.total_risk.values,
      },
    },
    {
      label: 'object ID',
      filterValues: {
        key: 'text-filter',
        // value: filters.text,
      },
    },
  ];

  const buildDisplayedRows = (filteredRows, sortIndex, sortDirection) => {
    void sortIndex;
    void sortDirection;

    return filteredRows.flatMap((row, index) => [
      row[0],
      { ...row[1], parent: index * 2 },
    ]);
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
    void filters;
    setRowsFiltered(false);

    return allRows.map((value, key) => [
      {
        rule: value,
        isOpen: isAllExpanded,
        cells: [
          {
            title: value.description,
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
                {/* <DateFormat
                  date={value.created_at}
                  type="relative"
                  tooltipProps={{ position: TooltipPosition.bottom }}
                /> */}
              </div>
            ),
          },
        ],
      },
      {
        cells: [
          {
            title: 'test',
          },
        ],
      },
    ]);
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
        // activeFiltersConfig={
        //   loadingState || errorState || reports.length === 0
        //     ? undefined
        //     : activeFiltersConfig
        // }
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
