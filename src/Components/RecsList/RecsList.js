import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import {
  Pagination,
  PaginationVariant,
  Stack,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';

import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar/PrimaryToolbar';

import {
  FILTER_CATEGORIES as FC,
  RECS_LIST_COLUMNS,
  RISK_OF_CHANGE_LABEL,
  TOTAL_RISK_LABEL_LOWER,
} from '../../AppConstants';
import { useLazyGetRecsQuery } from '../../Services/SmartProxy';
import messages from '../../Messages';
import {
  RECS_LIST_INITIAL_STATE,
  updateRecsListFilters as updateFilters,
} from '../../Services/Filters';
import RuleLabels from '../RuleLabels/RuleLabels';
import { strong } from '../../Utilities/intlHelper';
import RuleDetails from '../Recommendation/RuleDetails';

const RecsList = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [trigger, result, lastPromiseInfo] = useLazyGetRecsQuery();
  const {
    isError,
    isUninitialized,
    isFetching,
    isSuccess,
    data: rows = [],
  } = result;
  // filters for this table are stored in the Redux store
  const filters = useSelector(({ filters }) => filters.recsListState);
  const page = filters.offset / filters.limit + 1;
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const refresh = () => {
    trigger();
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const newDisplayedRows = buildDisplayedRows(filteredRows);
    setDisplayedRows(newDisplayedRows);
  }, [filteredRows, filters.limit, filters.offset]);

  useEffect(() => {
    const newFilteredRows = buildFilteredRows(rows, filters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows);
    // const newChips = updateNameChip(chips, filters.text);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
    // setChips(newChips);
  }, [result, filters]);

  // constructs array of rows (from the initial data) checking currently applied filters
  const buildFilteredRows = (allRows, filters) => {
    const filterFunc = (rule) => {
      return Object.entries(filters).every(([filterKey, filterValue]) => {
        if (filterKey === 'text') {
          return rule.rule_id.includes(filterValue);
        }
        if (filterKey === FC.total_risk.urlParam) {
          return filterValue.includes(String(rule.total_risk));
        }
        /* if (filterKey === FC.category.urlParam) {
          return rule.tags.find((c) =>
            filterValue.includes(RULE_CATEGORIES[c])
          );
        } */
        /* if (filterKey === FC.impact.urlParam) {
          return filterValue.includes(rule.impact.impact);
        } */
        /* if (filterKey === FC.impacting.urlParam) {
          return filterValue.length > 0
            ? filterValue.some((v) => {
                if (v === 'true') {
                  return rule.impacted_clusters_count > 0;
                }
                if (v === 'false') {
                  return rule.impacted_clusters_count === 0;
                }
              })
            : true;
        } */
        if (filterKey === FC.likelihood.urlParam) {
          return rule.likelihood === filterValue;
        }
        /* if (filterKey === FC.rule_status.urlParam) {
          return rule.rule_status === 'all'
            ? true
            : rule.rule_status === filterValue;
        } */
        return true;
      });
    };
    return allRows.filter(filterFunc).map((value, key) => [
      {
        isOpen: isAllExpanded,
        rule: value,
        cells: [
          {
            title: (
              <span key={key}>
                <Link key={key} to={`/recommendations/${value.rule_id}`}>
                  {' '}
                  {value?.description || value?.rule_id}{' '}
                </Link>
                <RuleLabels rule={value} />
              </span>
            ),
          },
          {
            title: value?.publish_date ? (
              <DateFormat
                key={key}
                date={value.publish_date}
                variant="relative"
              />
            ) : (
              intl.formatMessage(messages.nA)
            ),
          },
          {
            title: (
              <div key={key}>
                <Tooltip
                  key={key}
                  position={TooltipPosition.bottom}
                  content={intl.formatMessage(
                    messages.rulesDetailsTotalRiskBody,
                    {
                      risk:
                        TOTAL_RISK_LABEL_LOWER[value.total_risk] ||
                        intl.formatMessage(messages.undefined),
                      strong: (str) => strong(str),
                    }
                  )}
                >
                  {value?.total_risk ? (
                    <InsightsLabel value={value.total_risk} />
                  ) : (
                    intl.formatMessage(messages.nA)
                  )}
                </Tooltip>
              </div>
            ),
          },
          {
            title: (
              <div key={key}>
                {value?.resolution_risk ? (
                  <InsightsLabel
                    // resolution_risk is not yet exposed by API, expect undefined
                    text={RISK_OF_CHANGE_LABEL[value.resolution_risk]}
                    value={value.resolution_risk}
                    hideIcon
                  />
                ) : (
                  intl.formatMessage(messages.nA)
                )}
                <div></div>
              </div>
            ),
          },
          {
            title: (
              <div key={key}>{`${
                value?.impacted_clusters_count
                  ? value.impacted_clusters_count.toLocaleString()
                  : intl.formatMessage(messages.nA)
              }`}</div>
            ),
          },
        ],
      },
      {
        fullWidth: true,
        cells: [
          {
            title: (
              <Main className="pf-m-light">
                <Stack hasGutter>
                  {/* ! impact injection to be removed */}
                  <RuleDetails isOpenShift rule={{ ...value, impact: 0 }} />
                </Stack>
              </Main>
            ),
          },
        ],
      },
    ]);
  };

  const buildDisplayedRows = (rows) => {
    return rows
      .slice(
        filters.limit * (page - 1),
        filters.limit * (page - 1) + filters.limit
      )
      .flatMap((row, index) => {
        const updatedRow = [...row];
        row[1].parent = index * 2;
        return updatedRow;
      });
  };

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    delete filter[param];
    dispatch(
      updateFilters({ ...filter, ...(param === 'text' ? { text: '' } : {}) })
    );
  };

  const addFilterParam = (param, values) => {
    values.length > 0
      ? dispatch(
          updateFilters({ ...filters, offset: 0, ...{ [param]: values } })
        )
      : removeFilterParam(param);
  };

  const toggleRulesDisabled = (rule_status) => {
    dispatch(
      updateFilters({
        ...filters,
        rule_status,
        offset: 0,
        ...(rule_status !== 'enabled' && { impacting: ['false'] }),
      })
    );
  };

  /*
  const onSort = (_event, index, direction) => {
    const sort = () =>
      filteredRows.concat().sort((firstItem, secondItem) => {
        // console.log(firstItem, secondItem);
        const fst = firstItem?.rule?.[sortIndices[index]];
        const snd = secondItem?.rule?.[sortIndices[index]];
        if (!fst || !snd) {
          return 0;
        }
        return fst > snd ? 1 : snd > fst ? -1 : 0;
      });
    const sorted =
      direction === SortByDirection.asc ? sort() : sort().reverse();
    const newDisplayedRows = buildDisplayedRows(sorted);
    console.log(sorted, newDisplayedRows);
    dispatch(
      updateFilters({
        ...filters,
        sortIndex: index,
        sortDirection: direction,
        offset: 0,
      })
    );
    setFilteredRows(sorted);
    setDisplayedRows(newDisplayedRows);
  };
  */

  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) =>
          dispatch(updateFilters({ ...filters, text: value })),
        value: filters.text,
        placeholder: intl.formatMessage(messages.filterBy),
      },
    },
    {
      label: FC.total_risk.title,
      type: FC.total_risk.type,
      id: FC.total_risk.urlParam,
      value: `checkbox-${FC.total_risk.urlParam}`,
      filterValues: {
        key: `${FC.total_risk.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.total_risk.urlParam, values),
        value: filters.total_risk,
        items: FC.total_risk.values,
      },
    },
    /*
    {
      label: FC.res_risk.title,
      type: FC.res_risk.type,
      id: FC.res_risk.urlParam,
      value: `checkbox-${FC.res_risk.urlParam}`,
      filterValues: {
        key: `${FC.res_risk.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.res_risk.urlParam, values),
        value: filters.res_risk,
        items: FC.res_risk.values,
      },
    },*/
    {
      label: FC.impact.title,
      type: FC.impact.type,
      id: FC.impact.urlParam,
      value: `checkbox-${FC.impact.urlParam}`,
      filterValues: {
        key: `${FC.impact.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.impact.urlParam, values),
        value: filters.impact,
        items: FC.impact.values,
      },
    },
    {
      label: FC.likelihood.title,
      type: FC.likelihood.type,
      id: FC.likelihood.urlParam,
      value: `checkbox-${FC.likelihood.urlParam}`,
      filterValues: {
        key: `${FC.likelihood.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.likelihood.urlParam, values),
        value: filters.likelihood,
        items: FC.likelihood.values,
      },
    },
    {
      label: FC.category.title,
      type: FC.category.type,
      id: FC.category.urlParam,
      value: `checkbox-${FC.category.urlParam}`,
      filterValues: {
        key: `${FC.category.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FC.category.urlParam, values),
        value: filters.category,
        items: FC.category.values,
      },
    },
    {
      label: FC.rule_status.title,
      type: FC.rule_status.type,
      id: FC.rule_status.urlParam,
      value: `radio-${FC.rule_status.urlParam}`,
      filterValues: {
        key: `${FC.rule_status.urlParam}-filter`,
        onChange: (_event, value) => toggleRulesDisabled(value),
        value: `${filters.rule_status}`,
        items: FC.rule_status.values,
      },
    },
    {
      label: FC.impacting.title,
      type: FC.impacting.type,
      id: FC.impacting.urlParam,
      value: `checkbox-${FC.impacting.urlParam}`,
      filterValues: {
        key: `${FC.impacting.urlParam}-filter`,
        onChange: (e, values) => addFilterParam(FC.impacting.urlParam, values),
        value: filters.impacting,
        items: FC.impacting.values,
      },
    },
  ];

  const capitalize = (string) => string[0].toUpperCase() + string.substring(1);

  const pruneFilters = (localFilters, filterCategories) => {
    const prunedFilters = Object.entries(localFilters);
    return prunedFilters.length > 0
      ? prunedFilters.reduce((arr, item) => {
          if (filterCategories[item[0]]) {
            const category = filterCategories[item[0]];
            const chips = Array.isArray(item[1])
              ? item[1].map((value) => {
                  const selectedCategoryValue = category.values.find(
                    (values) => values.value === String(value)
                  );
                  return selectedCategoryValue
                    ? {
                        name:
                          selectedCategoryValue.text ||
                          selectedCategoryValue.label,
                        value,
                      }
                    : { name: value, value };
                })
              : [
                  {
                    name: category.values.find(
                      (values) => values.value === String(item[1])
                    ).label,
                    value: item[1],
                  },
                ];
            return [
              ...arr,
              {
                category: capitalize(category.title),
                chips,
                urlParam: category.urlParam,
              },
            ];
          } else if (item[0] === 'text') {
            return [
              ...arr,
              ...(item[1].length > 0
                ? [
                    {
                      category: 'Name',
                      chips: [{ name: item[1], value: item[1] }],
                      urlParam: item[0],
                    },
                  ]
                : []),
            ];
          } else {
            return arr;
          }
        }, [])
      : [];
  };

  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sortIndex;
    delete localFilters.sortDirection;
    delete localFilters.offset;
    delete localFilters.limit;

    return pruneFilters(localFilters, FC);
  };

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        dispatch(updateFilters(RECS_LIST_INITIAL_STATE));
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
            ? dispatch(updateFilters({ ...filters, ...newFilter }))
            : removeFilterParam(item.urlParam);
        });
      }
    },
  };

  const onExpandAllClick = (_e, isOpen) => {
    const newFilteredRows = [...filteredRows];
    setIsAllExpanded(isOpen);
    newFilteredRows.map((row, key) => {
      if (Object.prototype.hasOwnProperty.call(row[0], 'isOpen')) {
        newFilteredRows[key][0].isOpen = isOpen;
      }
    });
    setFilteredRows(newFilteredRows);
  };

  return (
    <React.Fragment>
      <Main>
        <React.Fragment>
          <PrimaryToolbar
            expandAll={{ isAllExpanded, onClick: onExpandAllClick }}
            pagination={{
              itemCount: filteredRows.length,
              page: filters.offset / filters.limit + 1,
              perPage: Number(filters.limit),
              onSetPage(_event, page) {
                dispatch(
                  updateFilters({
                    ...filters,
                    offset: filters.limit * (page - 1),
                  })
                );
              },
              onPerPageSelect(_event, perPage) {
                dispatch(
                  updateFilters({ ...filters, limit: perPage, offset: 0 })
                );
              },
              isCompact: true,
            }}
            filterConfig={{ items: filterConfigItems }}
            activeFiltersConfig={activeFiltersConfig}
          />
          {isSuccess && (
            <Table
              aria-label="Table of recommendations"
              ouiaId="recsListTable"
              variant={TableVariant.compact}
              cells={RECS_LIST_COLUMNS}
              rows={displayedRows}
              // sortBy={{ index: sortIndex, direction: sortDirection }}
              // onSort={onSort}
            >
              <TableHeader />
              <TableBody />
            </Table>
          )}
          <Pagination
            ouiaId="recs-list-pagination-bottom"
            itemCount={filteredRows.length}
            page={filters.offset / filters.limit + 1}
            perPage={Number(filters.limit)}
            onSetPage={(_e, page) => {
              dispatch(
                updateFilters({
                  ...filters,
                  offset: filters.limit * (page - 1),
                })
              );
            }}
            onPerPageSelect={(_e, perPage) => {
              dispatch(
                updateFilters({ ...filters, limit: perPage, offset: 0 })
              );
            }}
            widgetId={`pagination-options-menu-bottom`}
            variant={PaginationVariant.bottom}
          />
        </React.Fragment>
      </Main>
    </React.Fragment>
  );
};

export default RecsList;
