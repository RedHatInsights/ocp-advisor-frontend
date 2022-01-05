import './RecsListTable.scss';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
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
  TOTAL_RISK_LABEL_LOWER,
} from '../../AppConstants';
import messages from '../../Messages';
import {
  RECS_LIST_INITIAL_STATE,
  updateRecsListFilters as updateFilters,
} from '../../Services/Filters';
import RuleLabels from '../Labels/RuleLabels';
import { strong } from '../../Utilities/intlHelper';
import Loading from '../Loading/Loading';
import { ErrorState, NoMatchingRecs } from '../MessageState/EmptyStates';
import RuleDetails from '../Recommendation/RuleDetails';
import { passFilters, capitalize } from '../Common/Tables';
import DisableRule from '../Modals/DisableRule';
import { Delete } from '../../Utilities/Api';
import { BASE_URL } from '../../Services/SmartProxy';
import CategoryLabel, { extractCategories } from '../Labels/CategoryLabel';

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

  useEffect(() => {
    setDisplayedRows(
      buildDisplayedRows(filteredRows, filters.sortIndex, filters.sortDirection)
    );
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

  // constructs array of rows (from the initial data) checking currently applied filters
  const buildFilteredRows = (allRows, filters) => {
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
            { title: <CategoryLabel key={key} tags={value.tags} /> },
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
                      rule={{
                        ...value,
                        impact: { impact: value.impact },
                        // TODO: fix <Router> issue in the async component and then remove the line below
                        impacted_clusters_count: undefined,
                      }}
                      isDetailsPage={false}
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
    const sortedRecommendations = [
      'description',
      'publish_date',
      'tags',
      'total_risk',
      'impacted_clusters_count',
    ];
    const sortingRows = [...rows].sort((firstItem, secondItem) => {
      const fst = firstItem[0].rule[sortedRecommendations[index - 1]];
      const snd = secondItem[0].rule[sortedRecommendations[index - 1]];
      if (index === 3) {
        return extractCategories(fst)[0].localeCompare(
          extractCategories(snd)[0]
        );
      }
      return fst > snd ? 1 : snd > fst ? -1 : 0;
    });
    if (direction === SortByDirection.desc) {
      sortingRows.reverse();
    }
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
    dispatch(
      updateFilters({ ...filter, ...(param === 'text' ? { text: '' } : {}) })
    );
  };

  // TODO: update URL when filters changed
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
    dispatch(
      updateFilters({ ...filters, sortIndex: index, sortDirection: direction })
    );
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
    const rule = displayedRows[rowIndex].rule
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
    <div id="recs-list-table">
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
            dispatch(
              updateFilters({
                ...filters,
                offset: filters.limit * (page - 1),
              })
            );
          },
          onPerPageSelect(_event, perPage) {
            dispatch(updateFilters({ ...filters, limit: perPage, offset: 0 }));
          },
          isCompact: true,
        }}
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
      />
      {(isUninitialized || isFetching) && <Loading />}
      {(isError || (isSuccess && recs.length === 0)) && (
        <Card id="error-state-message">
          <CardBody>
            <ErrorState />
          </CardBody>
        </Card>
      )}
      {!(isUninitialized || isFetching) && isSuccess && recs.length > 0 && (
        <React.Fragment>
          <Table
            aria-label="Table of recommendations"
            ouiaId="recsListTable"
            variant={TableVariant.compact}
            cells={RECS_LIST_COLUMNS}
            rows={displayedRows}
            onCollapse={handleOnCollapse}
            sortBy={{
              index: filters.sortIndex,
              direction: filters.sortDirection,
            }}
            onSort={onSort}
            actionResolver={actionResolver}
            isStickyHeader
          >
            <TableHeader />
            <TableBody />
          </Table>
          {recs.length > 0 && filteredRows.length === 0 && (
            <Card ouiaId={'empty-recommendations'}>
              <CardBody>
                <NoMatchingRecs />
              </CardBody>
            </Card>
          )}
        </React.Fragment>
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
          dispatch(updateFilters({ ...filters, limit: perPage, offset: 0 }));
        }}
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
