import './RecsListTable.scss';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';
import {
  SortByDirection,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { Pagination, Stack, Tooltip } from '@patternfly/react-core';
import { TooltipPosition } from '@patternfly/react-core/dist/js/components/Tooltip';
import { PaginationVariant } from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import isEqual from 'lodash/isEqual';

import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar/PrimaryToolbar';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';

import {
  FILTER_CATEGORIES,
  RECS_LIST_CATEGORY_CELL,
  RECS_LIST_CLUSTERS_CELL,
  RECS_LIST_COLUMNS,
  RECS_LIST_COLUMNS_KEYS,
  RECS_LIST_MODIFIED_CELL,
  RECS_LIST_NAME_CELL,
  RECS_LIST_TOTAL_RISK_CELL,
  TOTAL_RISK_LABEL_LOWER,
  RISK_OF_CHANGE_LABEL,
  RECS_LIST_RISK_OF_CHANGE_CELL,
} from '../../AppConstants';
import messages from '../../Messages';
import {
  RECS_LIST_INITIAL_STATE,
  resetFilters,
  updateRecsListFilters,
} from '../../Services/Filters';
import RuleLabels from '../Labels/RuleLabels';
import { formatMessages, mapContentToValues } from '../../Utilities/intlHelper';
import { strong } from '../../Utilities/Helpers';
import { ErrorState, NoMatchingRecs } from '../MessageState/EmptyStates';
import {
  passFilters,
  paramParser,
  translateSortParams,
  updateSearchParams,
  removeFilterParam as _removeFilterParam,
  addFilterParam as _addFilterParam,
} from '../Common/Tables';
import DisableRule from '../Modals/DisableRule';
import { Delete } from '../../Utilities/Api';
import { BASE_URL } from '../../Services/SmartProxy';
import CategoryLabel, { extractCategories } from '../Labels/CategoryLabel';
import {
  AdvisorProduct,
  RuleDetails,
  RuleDetailsMessagesKeys,
} from '@redhat-cloud-services/frontend-components-advisor-components';
import { adjustOCPRule } from '../../Utilities/Rule';
import Loading from '../Loading/Loading';
import { inRange } from 'lodash';

const RecsListTable = ({ query }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const filters = useSelector(({ filters }) => filters.recsListState);
  const { isError, isUninitialized, isFetching, isSuccess, data, refetch } =
    query;
  const recs = data?.recommendations || [];
  const page = filters.offset / filters.limit + 1;
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [disableRuleOpen, setDisableRuleOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState({});
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const notify = (data) => dispatch(addNotification(data));
  const { search } = useLocation();
  const [filterBuilding, setFilterBuilding] = useState(true);
  // helps to distinguish the state when the API data received but not yet filtered
  const [rowsFiltered, setRowsFiltered] = useState(false);
  const updateFilters = (filters) => dispatch(updateRecsListFilters(filters));
  const searchText = filters?.text || '';
  const loadingState = isUninitialized || isFetching || !rowsFiltered;
  const errorState = isError || (isSuccess && recs.length === 0);
  const successState = isSuccess && recs.length > 0;
  const noMatch = recs.length > 0 && filteredRows.length === 0;

  const removeFilterParam = (param) =>
    _removeFilterParam(filters, updateFilters, param);

  const addFilterParam = (param, values) =>
    _addFilterParam(filters, updateFilters, param, values);

  useEffect(() => {
    setDisplayedRows(
      buildDisplayedRows(filteredRows, filters.sortIndex, filters.sortDirection)
    );
    setRowsFiltered(true);
  }, [
    filteredRows,
    filters.limit,
    filters.offset,
    filters.sortIndex,
    filters.sortDirection,
  ]);

  useEffect(() => {
    let filteredRows = buildFilteredRows(recs, filters);
    if (filteredRows.length && filteredRows.length <= filters.offset) {
      updateFilters({
        ...filters,
        offset: 0,
      });
    }
    setFilteredRows(filteredRows);
  }, [
    data,
    filters.category,
    filters.impact,
    filters.impacting,
    filters.total_risk,
    filters.rule_status,
    filters.likelihood,
    filters.res_risk,
    searchText,
  ]);

  useEffect(() => {
    if (search && filterBuilding) {
      const paramsObject = paramParser(search);

      if (paramsObject.sort) {
        const sortObj = translateSortParams(paramsObject.sort);
        paramsObject.sortIndex = RECS_LIST_COLUMNS_KEYS.indexOf(sortObj.name);
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
      updateSearchParams(filters, RECS_LIST_COLUMNS_KEYS);
    }
  }, [filters, filterBuilding]);

  // constructs array of rows (from the initial data) checking currently applied filters
  const buildFilteredRows = (allRows, filters) => {
    setRowsFiltered(false);
    return allRows
      .filter((rule) => passFilters(rule, filters))
      .map((value, key) => [
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
              title: <CategoryLabel key={key} tags={value.tags} />,
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
                        strong,
                      }
                    )}
                  >
                    {value?.total_risk ? (
                      <InsightsLabel
                        value={value.total_risk}
                        rest={{ isCompact: true }}
                      />
                    ) : (
                      intl.formatMessage(messages.nA)
                    )}
                  </Tooltip>
                </div>
              ),
            },
            {
              title: inRange(value?.resolution_risk, 1, 5) ? (
                <InsightsLabel
                  value={value.resolution_risk}
                  rest={{ isCompact: true }}
                  text={RISK_OF_CHANGE_LABEL[value.resolution_risk]}
                  hideIcon
                />
              ) : (
                intl.formatMessage(messages.nA)
              ),
            },
            {
              title: (
                <div key={key}>{`${
                  value?.impacted_clusters_count !== undefined
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
                <section className="pf-m-light pf-l-page__main-section pf-c-page__main-section">
                  <Stack hasGutter>
                    <RuleDetails
                      messages={formatMessages(
                        intl,
                        RuleDetailsMessagesKeys,
                        mapContentToValues(intl, adjustOCPRule(value))
                      )}
                      product={AdvisorProduct.ocp}
                      rule={adjustOCPRule(value)}
                      isDetailsPage={false}
                      showViewAffected
                      linkComponent={Link}
                    />
                  </Stack>
                </section>
              ),
            },
          ],
        },
      ]);
  };
  /* the category sorting compares only the first element of the array.
   Could be refactored later when we assign a priority numbers to each of the category
   and sort them in the array based on the priority.
*/
  const buildDisplayedRows = (rows, index, direction) => {
    const sortingRows = [...rows].sort((firstItem, secondItem) => {
      let fst = firstItem[0].rule,
        snd = secondItem[0].rule;
      const d = direction === SortByDirection.asc ? 1 : -1;
      switch (index) {
        case RECS_LIST_NAME_CELL:
          fst = fst.description;
          snd = snd.description;
          return fst.localeCompare(snd) ? fst.localeCompare(snd) * d : 0;
        case RECS_LIST_MODIFIED_CELL:
          fst = new Date(fst.publish_date || 0);
          snd = new Date(snd.publish_date || 0);
          return fst > snd ? d : snd > fst ? -d : 0;
        case RECS_LIST_CATEGORY_CELL:
          return (
            d *
            extractCategories(fst.tags)[0].localeCompare(
              extractCategories(snd.tags)[0]
            )
          );
        case RECS_LIST_TOTAL_RISK_CELL:
          fst = fst.total_risk;
          snd = snd.total_risk;
          return fst > snd ? d : snd > fst ? -d : 0;
        case RECS_LIST_RISK_OF_CHANGE_CELL:
          fst = fst.resolution_risk;
          snd = snd.resolution_risk;
          return fst > snd ? d : snd > fst ? -d : 0;
        case RECS_LIST_CLUSTERS_CELL:
          fst = fst.impacted_clusters_count;
          snd = snd.impacted_clusters_count;
          return fst > snd ? d : snd > fst ? -d : 0;
        default:
          console.error('Incorrect sorting parameters received');
      }
    });
    return sortingRows
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

  const toggleRulesDisabled = (rule_status) =>
    updateFilters({
      ...filters,
      rule_status,
      offset: 0,
    });

  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) =>
          updateFilters({ ...filters, offset: 0, text: value }),
        value: searchText,
        placeholder: intl.formatMessage(messages.filterByName),
      },
    },
    {
      label: FILTER_CATEGORIES.total_risk.title,
      type: FILTER_CATEGORIES.total_risk.type,
      id: FILTER_CATEGORIES.total_risk.urlParam,
      value: `checkbox-${FILTER_CATEGORIES.total_risk.urlParam}`,
      filterValues: {
        key: `${FILTER_CATEGORIES.total_risk.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FILTER_CATEGORIES.total_risk.urlParam, values),
        value: filters.total_risk,
        items: FILTER_CATEGORIES.total_risk.values,
      },
    },
    {
      label: FILTER_CATEGORIES.impact.title,
      type: FILTER_CATEGORIES.impact.type,
      id: FILTER_CATEGORIES.impact.urlParam,
      value: `checkbox-${FILTER_CATEGORIES.impact.urlParam}`,
      filterValues: {
        key: `${FILTER_CATEGORIES.impact.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FILTER_CATEGORIES.impact.urlParam, values),
        value: filters.impact,
        items: FILTER_CATEGORIES.impact.values,
      },
    },
    {
      label: FILTER_CATEGORIES.likelihood.title,
      type: FILTER_CATEGORIES.likelihood.type,
      id: FILTER_CATEGORIES.likelihood.urlParam,
      value: `checkbox-${FILTER_CATEGORIES.likelihood.urlParam}`,
      filterValues: {
        key: `${FILTER_CATEGORIES.likelihood.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FILTER_CATEGORIES.likelihood.urlParam, values),
        value: filters.likelihood,
        items: FILTER_CATEGORIES.likelihood.values,
      },
    },
    {
      label: FILTER_CATEGORIES.category.title,
      type: FILTER_CATEGORIES.category.type,
      id: FILTER_CATEGORIES.category.urlParam,
      value: `checkbox-${FILTER_CATEGORIES.category.urlParam}`,
      filterValues: {
        key: `${FILTER_CATEGORIES.category.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(FILTER_CATEGORIES.category.urlParam, values),
        value: filters.category,
        items: FILTER_CATEGORIES.category.values,
      },
    },
    {
      label: FILTER_CATEGORIES.rule_status.title,
      type: FILTER_CATEGORIES.rule_status.type,
      id: FILTER_CATEGORIES.rule_status.urlParam,
      value: `radio-${FILTER_CATEGORIES.rule_status.urlParam}`,
      filterValues: {
        key: `${FILTER_CATEGORIES.rule_status.urlParam}-filter`,
        onChange: (_event, value) => toggleRulesDisabled(value),
        value: `${filters.rule_status}`,
        items: FILTER_CATEGORIES.rule_status.values,
      },
    },
    {
      label: FILTER_CATEGORIES.impacting.title,
      type: FILTER_CATEGORIES.impacting.type,
      id: FILTER_CATEGORIES.impacting.urlParam,
      value: `checkbox-${FILTER_CATEGORIES.impacting.urlParam}`,
      filterValues: {
        key: `${FILTER_CATEGORIES.impacting.urlParam}-filter`,
        onChange: (e, values) =>
          addFilterParam(FILTER_CATEGORIES.impacting.urlParam, values),
        value: filters.impacting,
        items: FILTER_CATEGORIES.impacting.values,
      },
    },
    {
      label: FILTER_CATEGORIES.res_risk.title,
      type: FILTER_CATEGORIES.res_risk.type,
      id: FILTER_CATEGORIES.res_risk.urlParam,
      value: `checkbox-${FILTER_CATEGORIES.res_risk.urlParam}`,
      filterValues: {
        key: `${FILTER_CATEGORIES.res_risk.urlParam}-filter`,
        onChange: (e, values) =>
          addFilterParam(FILTER_CATEGORIES.res_risk.urlParam, values),
        value: filters.res_risk,
        items: FILTER_CATEGORIES.res_risk.values,
      },
    },
  ];

  const onSort = (_e, index, direction) => {
    setRowsFiltered(false);
    return updateFilters({
      ...filters,
      sortIndex: index,
      sortDirection: direction,
    });
  };

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

  // TODO: use the function from Common/Tables.js
  const buildFilterChips = () => {
    const localFilters = { ...filters };
    delete localFilters.sortIndex;
    delete localFilters.sortDirection;
    delete localFilters.offset;
    delete localFilters.limit;
    return pruneFilters(localFilters, FILTER_CATEGORIES);
  };

  const activeFiltersConfig = {
    showDeleteButton: true,
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        if (isEqual(filters, RECS_LIST_INITIAL_STATE)) {
          refetch();
        } else {
          resetFilters(filters, RECS_LIST_INITIAL_STATE, updateFilters);
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

  const handleOnCollapse = (_e, rowId, isOpen) => {
    if (rowId === undefined) {
      // if undefined, all rows are affected
      setIsAllExpanded(isOpen);
      setDisplayedRows(
        displayedRows.map((row) => ({
          ...row,
          isOpen: isOpen,
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

  const ackRule = async (rowId) => {
    const rule = displayedRows[rowId].rule;

    try {
      if (!rule.disabled) {
        // show disable rule modal
        setSelectedRule(rule);
        setDisableRuleOpen(true);
      } else {
        try {
          await Delete(`${BASE_URL}/v2/ack/${rule.rule_id}`);
          notify({
            variant: 'success',
            timeout: true,
            dismissable: true,
            title: intl.formatMessage(messages.recSuccessfullyEnabled),
          });
          refetch();
        } catch (error) {
          notify({
            variant: 'danger',
            dismissable: true,
            title: intl.formatMessage(messages.error),
            description: `${error}`,
          });
        }
      }
    } catch (error) {
      notify({
        variant: 'danger',
        dismissable: true,
        title: rule.disabled
          ? intl.formatMessage(messages.rulesTableErrorEnabled)
          : intl.formatMessage(messages.rulesTableErrorDisabled),
        description: `${error}`,
      });
    }
  };

  const actionResolver = (rowData, { rowIndex }) => {
    const rule = displayedRows?.[rowIndex]?.rule
      ? displayedRows[rowIndex].rule
      : null;
    if (rowIndex % 2 !== 0 || !rule) {
      return null;
    }

    return rule && !rule.disabled
      ? [
          {
            title: intl.formatMessage(messages.disableRule),
            onClick: (_event, rowId) => ackRule(rowId),
          },
        ]
      : [
          {
            title: intl.formatMessage(messages.enableRule),
            onClick: (_event, rowId) => ackRule(rowId),
          },
        ];
  };

  return (
    <div id="recs-list-table" data-ouia-safe={!loadingState}>
      {disableRuleOpen && (
        <DisableRule
          handleModalToggle={setDisableRuleOpen}
          isModalOpen={disableRuleOpen}
          rule={selectedRule}
          afterFn={refetch}
        />
      )}
      <PrimaryToolbar
        pagination={{
          itemCount: filteredRows.length,
          page: filters.offset / filters.limit + 1,
          perPage: Number(filters.limit),
          onSetPage(_event, page) {
            setRowsFiltered(false);
            updateFilters({
              ...filters,
              offset: filters.limit * (page - 1),
            });
          },
          onPerPageSelect(_event, perPage) {
            setRowsFiltered(false);
            updateFilters({ ...filters, limit: perPage, offset: 0 });
          },
          isCompact: true,
          ouiaId: 'pager',
        }}
        filterConfig={{
          items: filterConfigItems,
          isDisabled: loadingState || errorState,
        }}
        activeFiltersConfig={errorState ? undefined : activeFiltersConfig}
      />
      <Table
        aria-label="Table of recommendations"
        ouiaId="recommendations"
        variant={TableVariant.compact}
        cells={RECS_LIST_COLUMNS}
        rows={
          errorState || loadingState || noMatch ? (
            [
              {
                fullWidth: true,
                cells: [
                  {
                    props: {
                      colSpan: RECS_LIST_COLUMNS.length + 1,
                    },
                    title: errorState ? (
                      <ErrorState />
                    ) : loadingState ? (
                      <Loading />
                    ) : (
                      <NoMatchingRecs />
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
        onCollapse={handleOnCollapse} // TODO: set undefined when there is an empty state
        sortBy={{
          index: filters.sortIndex,
          direction: filters.sortDirection,
        }}
        onSort={onSort}
        actionResolver={actionResolver}
        isStickyHeader
        ouiaSafe={!loadingState}
        canCollapseAll
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
  );
};

RecsListTable.propTypes = {
  query: PropTypes.shape({
    isError: PropTypes.bool.isRequired,
    isUninitialized: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    isSuccess: PropTypes.bool.isRequired,
    data: PropTypes.object,
    refetch: PropTypes.func,
  }),
};

export { RecsListTable };
