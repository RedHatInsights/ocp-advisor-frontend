import './_ClusterRules.scss';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import capitalize from 'lodash/capitalize';

import CheckIcon from '@patternfly/react-icons/dist/js/icons/check-icon';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat/DateFormat';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import {
  SortByDirection,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { Card, CardBody } from '@patternfly/react-core/dist/js/components/Card';
import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/js/components/Tooltip';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';

import messages from '../../Messages';
import MessageState from '../MessageState/MessageState';
import {
  IMPACT_LABEL,
  LIKELIHOOD_LABEL,
  FILTER_CATEGORIES as FC,
  CLUSTER_RULES_COLUMNS_KEYS,
  FILTER_CATEGORIES,
  CLUSTER_RULES_COLUMNS,
} from '../../AppConstants';
import ReportDetails from '../ReportDetails/ReportDetails';
import RuleLabels from '../Labels/RuleLabels';
import { NoMatchingRecs } from '../MessageState/EmptyStates';
import {
  paramParser,
  passFilters,
  translateSortParams,
} from '../Common/Tables';
import {
  CLUSTER_RULES_INITIAL_STATE,
  updateClusterRulesFilters,
} from '../../Services/Filters';
import { getErrorKey, getPluginName } from '../../Utilities/Rule';

const ClusterRules = ({ reports }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const updateFilters = (filters) =>
    dispatch(updateClusterRulesFilters(filters));
  const filters = useSelector(({ filters }) => filters.clusterRulesState);

  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [expandFirst, setExpandFirst] = useState(true);
  const [firstRule, setFirstRule] = useState(''); // show a particular rule first
  const results = filteredRows.length;
  const { search } = useLocation();

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
    setFilteredRows(buildFilteredRows(reports, filters));
  }, [reports, filters]);

  useEffect(() => {
    if (search) {
      const paramsObject = paramParser(search);
      if (paramsObject.sort) {
        const sortObj = translateSortParams(paramsObject.sort[0]);
        paramsObject.sortIndex = CLUSTER_RULES_COLUMNS_KEYS.indexOf(
          sortObj.name
        );
        paramsObject.sortDirection = sortObj.direction;
      }
      if (paramsObject.first) {
        setFirstRule(paramsObject.first);
        delete paramsObject.first;
      }
      updateFilters({ ...filters, ...paramsObject });
    }
  }, []);

  const handleOnCollapse = (_e, rowId, isOpen) => {
    const collapseRows = [...displayedRows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setDisplayedRows(collapseRows);
  };

  const buildFilteredRows = (allRows, filters) =>
    allRows
      .filter((rule) => passFilters(rule, filters))
      .map((value, key) => [
        {
          rule: value,
          isOpen: isAllExpanded,
          cells: [
            {
              title: (
                <div>
                  {value?.description || value?.rule_id}{' '}
                  <RuleLabels rule={value} />
                </div>
              ),
            },
            {
              title: (
                <div key={key}>
                  <DateFormat
                    date={value.created_at}
                    type="relative"
                    tooltipProps={{ position: TooltipPosition.bottom }}
                  />
                </div>
              ),
            },
            {
              title: (
                <div key={key} style={{ verticalAlign: 'top' }}>
                  {value?.likelihood && value?.impact ? (
                    <Tooltip
                      key={key}
                      position={TooltipPosition.bottom}
                      content={
                        // TODO: refine fields lookup
                        <span>
                          The <strong>likelihood</strong> that this will be a
                          problem is{' '}
                          {value.likelihood
                            ? LIKELIHOOD_LABEL[value.likelihood]
                            : 'unknown'}
                          .The <strong>impact</strong> of the problem would be{' '}
                          {value.impact
                            ? IMPACT_LABEL[value.impact]
                            : 'unknown'}{' '}
                          if it occurred.
                        </span>
                      }
                    >
                      <InsightsLabel
                        value={value.total_risk}
                        rest={{ isCompact: true }}
                      />
                    </Tooltip>
                  ) : (
                    <InsightsLabel
                      value={value.total_risk}
                      rest={{ isCompact: true }}
                    />
                  )}
                </div>
              ),
            },
          ],
        },
        {
          fullWidth: true,
          cells: [
            {
              title: <ReportDetails key={`child-${key}`} report={value} />,
            },
          ],
        },
      ]);

  const buildDisplayedRows = (rows, index, direction) => {
    let sortingRows = [...rows];
    if (index >= 0) {
      const d = direction === SortByDirection.asc ? 1 : -1;
      sortingRows = [...rows].sort((firstItem, secondItem) => {
        const fst = firstItem[0].rule[CLUSTER_RULES_COLUMNS_KEYS[index - 1]];
        const snd = secondItem[0].rule[CLUSTER_RULES_COLUMNS_KEYS[index - 1]];
        return fst > snd ? d : snd > fst ? -d : 0;
      });
    } else if (firstRule) {
      const i = rows.findIndex((row) => {
        const rule = row[0].rule;
        /* rule_id is given with the plugin name only,
           thus we need to look at extra_data for the error key */
        return (
          rule.rule_id.split('.report')[0] === getPluginName(firstRule) &&
          rule.extra_data.error_key === getErrorKey(firstRule)
        );
      });
      i !== -1 && sortingRows.unshift(sortingRows.splice(i, 1)[0]);
    }
    return sortingRows.flatMap((row, index) => {
      const updatedRow = [...row];
      if (expandFirst && index === 0) {
        row[0].isOpen = true;
      }
      row[1].parent = index * 2;
      return updatedRow;
    });
  };

  const onSort = (_e, index, direction) => {
    //setExpandFirst(false);
    return updateFilters({
      ...filters,
      sortIndex: index,
      sortDirection: direction,
    });
  };

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    delete filter[param];
    updateFilters({ ...filter, ...(param === 'text' ? { text: '' } : {}) });
  };

  // TODO: update URL when filters changed
  const addFilterParam = (param, values) => {
    setExpandFirst(false);
    setFirstRule('');
    return values.length > 0
      ? updateFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param);
  };

  const filterConfigItems = [
    {
      label: 'description',
      filterValues: {
        key: 'text-filter',
        onChange: (_e, value) => addFilterParam('text', value),
        value: filters.text,
      },
    },
    {
      label: FC.total_risk.title,
      type: FC.total_risk.type,
      id: FC.total_risk.urlParam,
      value: `checkbox-${FC.total_risk.urlParam}`,
      filterValues: {
        key: `${FC.total_risk.urlParam}-filter`,
        onChange: (_e, values) =>
          addFilterParam(FILTER_CATEGORIES.total_risk.urlParam, values),
        value: filters.total_risk,
        items: FC.total_risk.values,
      },
    },
    {
      label: FC.category.title,
      type: FC.category.type,
      id: FC.category.urlParam,
      value: `checkbox-${FC.category.urlParam}`,
      filterValues: {
        key: `${FC.category.urlParam}-filter`,
        onChange: (_e, values) =>
          addFilterParam(FILTER_CATEGORIES.category.urlParam, values),
        value: filters.category,
        items: FC.category.values,
      },
    },
  ];

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
                      category: intl.formatMessage(messages.description),
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
        updateFilters(CLUSTER_RULES_INITIAL_STATE);
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

  return (
    <div id="cluster-recs-list-table">
      <PrimaryToolbar
        expandAll={{ isAllExpanded, onClick: collapseAll }}
        filterConfig={{
          items: filterConfigItems,
          isDisabled: reports.length === 0,
        }}
        pagination={
          <React.Fragment>
            {results === 1
              ? `${results} ${intl.formatMessage(messages.recommendation)}`
              : `${results} ${intl.formatMessage(messages.recommendations)}`}
          </React.Fragment>
        }
        activeFiltersConfig={
          reports.length === 0 ? undefined : activeFiltersConfig
        }
      />
      {reports.length > 0 ? (
        <React.Fragment>
          <Table
            aria-label={'Cluster recommendations table'}
            ouiaId="recommendations"
            onCollapse={handleOnCollapse}
            rows={displayedRows}
            cells={CLUSTER_RULES_COLUMNS}
            sortBy={{
              index: filters.sortIndex,
              direction: filters.sortDirection,
            }}
            onSort={onSort}
            variant={TableVariant.compact}
            isStickyHeader
          >
            <TableHeader />
            <TableBody />
          </Table>
          {results === 0 && (
            <Card ouiaId="empty-state">
              <CardBody>
                <NoMatchingRecs />
              </CardBody>
            </Card>
          )}
        </React.Fragment>
      ) : (
        // ? Welcome to Insights feature for novice clusters with disabled Insights?
        <Card ouiaId="no-recommendations">
          <CardBody>
            <MessageState
              icon={CheckIcon}
              iconClass="ins-c-insights__check"
              title={intl.formatMessage(messages.noRecommendations)}
              text={intl.formatMessage(messages.noRecommendationsDesc)}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

ClusterRules.propTypes = {
  reports: PropTypes.array.isRequired,
};

ClusterRules.defaultProps = {
  reports: [],
};

export default ClusterRules;
