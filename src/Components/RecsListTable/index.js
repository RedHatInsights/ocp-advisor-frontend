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
  Card,
  CardBody,
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
  TOTAL_RISK_LABEL_LOWER,
} from '../../AppConstants';
import { useGetRecsQuery } from '../../Services/SmartProxy';
import messages from '../../Messages';
import {
  RECS_LIST_INITIAL_STATE,
  updateRecsListFilters as updateFilters,
} from '../../Services/Filters';
import RuleLabels from '../RuleLabels/RuleLabels';
import { strong } from '../../Utilities/intlHelper';
import Loading from '../Loading/Loading';
import { ErrorState, NoMatchingRecs } from '../MessageState/EmptyStates';
import RuleDetails from '../Recommendation/RuleDetails';
import { passFilters } from '../Common/Tables';

const RecsListTable = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const filters = useSelector(({ filters }) => filters.recsListState);
  const { isError, isUninitialized, isFetching, isSuccess, data } =
    useGetRecsQuery({ impacting: false });
  const recs = data?.recommendations || [];
  const page = filters.offset / filters.limit + 1;
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);

  useEffect(() => {
    setDisplayedRows(buildDisplayedRows(filteredRows));
  }, [filteredRows, filters.limit, filters.offset]);

  useEffect(() => {
    const newFilteredRows = buildFilteredRows(recs, filters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
  }, [recs, filters]);

  // constructs array of rows (from the initial data) checking currently applied filters
  const buildFilteredRows = (allRows, filters) => {
    return allRows
      .filter((rule) => passFilters(rule, filters))
      .map((value, key) => [
        {
          isOpen: false,
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
                        : `/recommendations/${value.rule_id}`
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
                <Main className="pf-m-light">
                  <Stack hasGutter>
                    <RuleDetails
                      isOpenShift
                      rule={{
                        ...value,
                        impact: { impact: value.impact },
                      }}
                    />
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

  // TODO: update URL when filters changed
  const addFilterParam = (param, values) => {
    values.length > 0
      ? dispatch(
          updateFilters({ ...filters, offset: 0, ...{ [param]: values } })
        )
      : removeFilterParam(param);
  };

  /* const toggleRulesDisabled = (rule_status) => {
    dispatch(
      updateFilters({
        ...filters,
        rule_status,
        offset: 0,
        ...(rule_status !== 'enabled' && { impacting: ['false'] }),
      })
    );
  }; */

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
    } /*
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
    },*/,
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

  const handleOnCollapse = (_e, rowId, isOpen) => {
    const collapseRows = [...displayedRows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setDisplayedRows(collapseRows);
  };

  return (
    <React.Fragment>
      <PrimaryToolbar
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
        <Card>
          <CardBody>
            <ErrorState />
          </CardBody>
        </Card>
      )}
      {isSuccess && recs.length > 0 && (
        <React.Fragment>
          <Table
            aria-label="Table of recommendations"
            ouiaId="recsListTable"
            variant={TableVariant.compact}
            cells={RECS_LIST_COLUMNS}
            rows={displayedRows}
            onCollapse={handleOnCollapse}
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
    </React.Fragment>
  );
};

export default RecsListTable;
