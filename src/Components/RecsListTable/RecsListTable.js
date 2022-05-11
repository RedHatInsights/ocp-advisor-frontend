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
import { Card, CardBody } from '@patternfly/react-core/dist/js/components/Card';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/js/components/Pagination';
import { Stack } from '@patternfly/react-core/dist/js/layouts/Stack';
import isEqual from 'lodash/isEqual';
import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/js/components/Tooltip';

import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar/PrimaryToolbar';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';

import {
  FILTER_CATEGORIES,
  RECS_LIST_COLUMNS,
  RECS_LIST_COLUMNS_KEYS,
  TOTAL_RISK_LABEL_LOWER,
} from '../../AppConstants';
import messages from '../../Messages';
import {
  RECS_LIST_INITIAL_STATE,
  updateRecsListFilters,
} from '../../Services/Filters';
import RuleLabels from '../Labels/RuleLabels';
import {
  formatMessages,
  mapContentToValues,
  strong,
} from '../../Utilities/intlHelper';
import { List } from 'react-content-loader';
import { ErrorState, NoMatchingRecs } from '../MessageState/EmptyStates';
import {
  passFilters,
  paramParser,
  translateSortParams,
  updateSearchParams,
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
  // helps to distinguish if the component safe to test
  const testSafe = rowsFiltered && !(isFetching || isUninitialized);
  const updateFilters = (filters) => dispatch(updateRecsListFilters(filters));
  const searchText = filters?.text || '';
  const loadingState = isUninitialized || isFetching || !rowsFiltered;
  const errorState = isError || (isSuccess && recs.length === 0);
  const successState = isSuccess && recs.length > 0;

  useEffect(() => {
    setDisplayedRows(
      buildDisplayedRows(filteredRows, filters.sortIndex, filters.sortDirection)
    );
    if (isSuccess && !rowsFiltered) {
      setRowsFiltered(true);
    }
  }, [
    filteredRows,
    filters.limit,
    filters.offset,
    filters.sortIndex,
    filters.sortDirection,
  ]);

  useEffect(() => {
    setFilteredRows(buildFilteredRows(recs, filters));
  }, [data, filters]);

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
                  <Link
                    key={key}
                    // https://github.com/RedHatInsights/ocp-advisor-frontend/issues/29
                    to={`/recommendations/${
                      process.env.NODE_ENV === 'development'
                        ? value.rule_id.replaceAll('.', '%2E')
                        : value.rule_id
                    }`}
                  >
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

  const buildDisplayedRows = (rows, index, direction) => {
    const sortingRows = [...rows].sort((firstItem, secondItem) => {
      const d = direction === SortByDirection.asc ? 1 : -1;
      const fst = firstItem[0].rule[RECS_LIST_COLUMNS_KEYS[index]];
      const snd = secondItem[0].rule[RECS_LIST_COLUMNS_KEYS[index]];
      if (index === 3) {
        const categoryCompare = extractCategories(fst)[0].localeCompare(
          extractCategories(snd)[0]
        );
        return categoryCompare === 1 ? d : categoryCompare === -1 ? -d : 0;
      }
      return fst > snd ? d : snd > fst ? -d : 0;
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

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    delete filter[param];
    updateFilters({ ...filter, ...(param === 'text' ? { text: '' } : {}) });
  };

  // TODO: update URL when filters changed
  const addFilterParam = (param, values) =>
    values.length > 0
      ? updateFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param);

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
        placeholder: intl.formatMessage(messages.filterBy),
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
          updateFilters(RECS_LIST_INITIAL_STATE);
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

  //Responsible for the handling collapse for all the recommendations
  //Used in the PrimaryToolbar
  const collapseAll = (_e, isOpen) => {
    setIsAllExpanded(isOpen);
    setDisplayedRows(
      displayedRows.map((row) => {
        return {
          ...row,
          isOpen: isOpen,
        };
      })
    );
  };

  //Responsible for handling collapse for single recommendation
  const handleOnCollapse = (_e, rowId, isOpen) => {
    const collapseRows = [...displayedRows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setDisplayedRows(collapseRows);
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
          await Delete(`${BASE_URL}/v2/ack/${rule.rule_id}/`);
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
    <div id="recs-list-table" data-ouia-safe={testSafe}>
      {disableRuleOpen && (
        <DisableRule
          handleModalToggle={setDisableRuleOpen}
          isModalOpen={disableRuleOpen}
          rule={selectedRule}
          afterFn={refetch}
        />
      )}
      <PrimaryToolbar
        expandAll={{ isAllExpanded, onClick: collapseAll }}
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
      {errorState && (
        <Card id="error-state-message" ouiaId="error-state">
          <CardBody>
            <ErrorState />
          </CardBody>
        </Card>
      )}
      {(loadingState || successState) && (
        <React.Fragment>
          <Table
            aria-label="Table of recommendations"
            ouiaId="recommendations"
            variant={TableVariant.compact}
            cells={RECS_LIST_COLUMNS}
            rows={
              loadingState
                ? [
                    {
                      fullWidth: true,
                      cells: [
                        {
                          props: { colSpan: 5 },
                          title: <List key="loading-cell" />,
                        },
                      ],
                    },
                  ]
                : recs.length > 0 && filteredRows.length === 0
                ? [
                    {
                      fullWidth: true,
                      cells: [
                        {
                          props: { colSpan: 5 },
                          title: <NoMatchingRecs ouiaId="empty-state" />,
                        },
                      ],
                    },
                  ]
                : displayedRows
            }
            onCollapse={handleOnCollapse}
            sortBy={{
              index: filters.sortIndex,
              direction: filters.sortDirection,
            }}
            onSort={onSort}
            actionResolver={actionResolver}
            isStickyHeader
            ouiaSafe={testSafe}
          >
            <TableHeader />
            <TableBody />
          </Table>
        </React.Fragment>
      )}
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
    data: PropTypes.array,
    refetch: PropTypes.func,
  }),
};

export { RecsListTable };
