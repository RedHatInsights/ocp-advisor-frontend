import './_ClusterRules.scss';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import CheckIcon from '@patternfly/react-icons/dist/js/icons/check-icon';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat/DateFormat';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import {
  SortByDirection,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
  cellWidth,
  sortable,
} from '@patternfly/react-table';
import { capitalize } from '@patternfly/react-core/dist/js/helpers/util';
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
  RULE_CATEGORIES,
  DEFAULT_CLUSTER_RULES_FILTERS,
} from '../../AppConstants';
import ReportDetails from '../ReportDetails/ReportDetails';
import RuleLabels from '../RuleLabels/RuleLabels';

const ClusterRules = ({ reports }) => {
  const intl = useIntl();
  const [activeReports, setActiveReports] = useState([]);
  const [sortBy, setSortBy] = useState({});
  const [filters, setFilters] = useState(DEFAULT_CLUSTER_RULES_FILTERS);
  const [searchValue, setSearchValue] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [rows, setRows] = useState([]);
  const results = rows ? rows.length / 2 : 0;

  const cols = [
    {
      title: intl.formatMessage(messages.description),
      transforms: [sortable],
    },
    {
      title: intl.formatMessage(messages.added),
      transforms: [sortable, cellWidth(15)],
    },
    {
      title: intl.formatMessage(messages.totalRisk),
      transforms: [sortable, cellWidth(15)],
    },
  ];

  const handleOnCollapse = (_e, rowId, isOpen) => {
    const collapseRows = [...rows];
    collapseRows[rowId] = { ...collapseRows[rowId], isOpen };
    setRows(collapseRows);
  };

  const onKebabClick = (action) => {
    const isOpen = action === 'insights-expand-all';
    const allRows = [...rows];

    allRows.map((row, key) => {
      if (Object.prototype.hasOwnProperty.call(row, 'isOpen')) {
        row.isOpen = isOpen;
        isOpen && handleOnCollapse(null, key, isOpen);
      }
    });

    setRows(allRows);
  };

  const actions = [
    {
      label: 'Collapse all',
      onClick: () => onKebabClick('insights-collapse-all'),
    },
    {
      label: 'Expand all',
      onClick: () => onKebabClick('insights-expand-all'),
    },
  ];

  const buildRows = (activeReports, filters, rows, searchValue = '') => {
    const builtRows = activeReports.flatMap((value, key) => {
      const rule = value;
      const resolution = value.resolution;
      const entity = rows.filter(
        (rowVal, rowKey) =>
          rowKey % 2 === 0 && rowVal.rule.rule_id === rule.rule_id && rowVal
      );
      const selected = entity.length ? entity[0].selected : false;
      const isOpen = rows.length
        ? entity.length
          ? entity[0].isOpen
          : false
        : key === 0
        ? true
        : false;

      const reportRow = [
        {
          rule,
          resolution,
          isOpen,
          selected,
          cells: [
            {
              title: (
                <div>
                  {rule.description} <RuleLabels rule={value} />
                </div>
              ),
            },
            {
              title: (
                <div key={key}>
                  <DateFormat
                    date={rule.created_at}
                    type="relative"
                    tooltipProps={{ position: TooltipPosition.bottom }}
                  />
                </div>
              ),
            },
            {
              title: (
                <div key={key} style={{ verticalAlign: 'top' }}>
                  {rule?.likelihood && rule?.impact ? (
                    <Tooltip
                      key={key}
                      position={TooltipPosition.bottom}
                      content={
                        // TODO: refine fields lookup
                        <span>
                          The <strong>likelihood</strong> that this will be a
                          problem is{' '}
                          {rule.likelihood
                            ? LIKELIHOOD_LABEL[rule.likelihood]
                            : 'unknown'}
                          . The <strong>impact</strong> of the problem would be{' '}
                          {rule.impact ? IMPACT_LABEL[rule.impact] : 'unknown'}{' '}
                          if it occurred.
                        </span>
                      }
                    >
                      <InsightsLabel value={rule.total_risk} />
                    </Tooltip>
                  ) : (
                    <InsightsLabel value={rule.total_risk} />
                  )}
                </div>
              ),
            },
          ],
        },
        {
          parent: key,
          fullWidth: true,
          cells: [
            {
              title: <ReportDetails key={`child-${key}`} report={value} />,
            },
          ],
        },
      ];
      const isValidSearchValue =
        searchValue.length === 0 ||
        rule.description.toLowerCase().includes(searchValue.toLowerCase());
      const isValidFilterValue =
        Object.keys(filters).length === 0 ||
        Object.keys(filters)
          .map((key) => {
            const filterValues = filters[key];
            const rowValue = {
              created_at: rule.created_at,
              total_risk: rule.total_risk,
              category: rule.tags,
              rule_status: rule.disabled ? 'disabled' : 'enabled',
            };
            if (key === 'category') {
              // in that case, rowValue['category'] is an array of categories (or "tags" in the back-end implementation)
              // e.g. ['security', 'fault_tolerance']
              return rowValue[key].find((categoryName) =>
                filterValues.includes(String(RULE_CATEGORIES[categoryName]))
              );
            }
            if (key === 'rule_status') {
              return filterValues === 'all' || rowValue[key] === filterValues;
            }
            return filterValues.find(
              (value) => String(value) === String(rowValue[key])
            );
          })
          .every((x) => x);

      return isValidSearchValue && isValidFilterValue ? reportRow : [];
    });
    // must recalculate parent for expandable table content whenever the array size changes
    builtRows.forEach((row, index) =>
      row.parent ? (row.parent = index - 1) : null
    );

    return builtRows;
  };

  const onSort = (_e, index, direction) => {
    const sortedReports = {
      2: 'description',
      3: 'created_at',
      4: 'total_risk',
    };
    const sort = () =>
      activeReports
        .concat()
        .sort((firstItem, secondItem) =>
          firstItem[sortedReports[index]] > secondItem[sortedReports[index]]
            ? 1
            : secondItem[sortedReports[index]] > firstItem[sortedReports[index]]
            ? -1
            : 0
        );
    const sortedReportsDirectional =
      direction === SortByDirection.asc ? sort() : sort().reverse();

    setActiveReports(sortedReportsDirectional);
    setSortBy({
      index,
      direction,
    });
    setRows(buildRows(sortedReportsDirectional, filters, rows, searchValue));
  };

  const onRowSelect = (_e, isSelected, rowId) =>
    setRows(
      buildRows(
        activeReports,
        filters,
        rows.map((row, index) =>
          index === rowId ? { ...row, selected: isSelected } : row
        ),
        searchValue
      )
    );

  const getSelectedItems = (rows) => rows.filter((entity) => entity.selected);
  const selectedItemsLength = getSelectedItems(rows).length;

  const onBulkSelect = (isSelected) => {
    setIsSelected(isSelected);
    setRows(
      buildRows(
        activeReports,
        filters,
        rows.map((row, index) =>
          index % 2 === 0 ? { ...row, selected: isSelected } : row
        ),
        searchValue
      )
    );
  };

  const bulkSelect = {
    items: [
      {
        title: 'Select none',
        onClick: () => onBulkSelect(false),
      },
      {
        title: 'Select all',
        onClick: () => onBulkSelect(true),
      },
    ],
    count: selectedItemsLength,
    checked: isSelected,
    onSelect: () => onBulkSelect(!isSelected),
    ouiaId: 'bulk-selector',
  };

  const onInputChange = (value) => {
    const builtRows = buildRows(activeReports, filters, rows, value);
    setSearchValue(value);
    setRows(builtRows);
  };

  const onFilterChange = (param, values) => {
    const removeFilterParam = (param) => {
      const filter = { ...filters };
      delete filter[param];
      return filter;
    };

    const newFilters =
      values.length > 0
        ? { ...filters, ...{ [param]: values } }
        : removeFilterParam(param);
    setRows(buildRows(activeReports, newFilters, rows, searchValue));
    setFilters(newFilters);
  };

  const toggleRulesDisabled = (rule_status) => {
    const newFilters = { ...filters, rule_status };
    setRows(buildRows(activeReports, newFilters, rows, searchValue));
    setFilters(newFilters);
  };

  const filterConfigItems = [
    {
      label: 'description',
      filterValues: {
        key: 'text-filter',
        onChange: (_e, value) => onInputChange(value),
        value: searchValue,
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
          onFilterChange(FC.total_risk.urlParam, values),
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
        onChange: (_e, values) => onFilterChange(FC.category.urlParam, values),
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
        onChange: (_e, value) => toggleRulesDisabled(value),
        value: filters.rule_status,
        items: FC.rule_status.values,
      },
    },
  ];

  const buildFilterChips = () => {
    const prunedFilters = Object.entries(filters);
    let chips =
      filters && prunedFilters.length > 0
        ? prunedFilters.map((item) => {
            const category = FC[item[0]];
            const chips = Array.isArray(item[1])
              ? item[1].map((value) => ({
                  name: category.values.find(
                    (values) => values.value === String(value)
                  ).label,
                  value,
                }))
              : [
                  {
                    name: category.values.find(
                      (values) => values.value === String(item[1])
                    ).label,
                    value: item[1],
                  },
                ];
            return {
              category: capitalize(category.title),
              chips,
              urlParam: category.urlParam,
            };
          })
        : [];
    searchValue.length > 0 &&
      chips.push({
        category: 'Description',
        chips: [{ name: searchValue, value: searchValue }],
      });
    return chips;
  };

  const onChipDelete = (_e, itemsToRemove, isAll) => {
    if (isAll) {
      setRows(buildRows(activeReports, {}, rows, ''));
      setFilters(DEFAULT_CLUSTER_RULES_FILTERS);
      setSearchValue('');
    } else {
      itemsToRemove.map((item) => {
        switch (item.category) {
          case 'Description':
            setRows(buildRows(activeReports, filters, rows, ''));
            setSearchValue('');
            break;
          case 'Status':
            onFilterChange(item.urlParam, []);
            break;
          default:
            onFilterChange(
              item.urlParam,
              filters[item.urlParam].filter(
                (value) => String(value) !== String(item.chips[0].value)
              )
            );
        }
      });
    }
  };

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    filters: buildFilterChips(),
    onDelete: onChipDelete,
  };

  useEffect(() => {
    const activeReportsData = reports;
    setActiveReports(activeReportsData);
    setRows(buildRows(activeReportsData, filters, rows, searchValue));
  }, []);

  return (
    <div>
      <PrimaryToolbar
        actionsConfig={{ actions }}
        bulkSelect={bulkSelect}
        filterConfig={{ items: filterConfigItems, isDisabled: results === 0 }}
        pagination={
          <React.Fragment>
            {results === 1
              ? `${results} ${intl.formatMessage(messages.recommendation)}`
              : `${results} ${intl.formatMessage(messages.recommendations)}`}
          </React.Fragment>
        }
        activeFiltersConfig={results === 0 ? undefined : activeFiltersConfig}
      />
      {activeReports.length > 0 ? (
        <React.Fragment>
          <Table
            aria-label={'Cluster recommendations table'}
            ouiaId={'cluster-recommendations'}
            onSelect={onRowSelect}
            onCollapse={handleOnCollapse}
            rows={rows}
            cells={cols}
            sortBy={sortBy}
            canSelectAll={false}
            onSort={onSort}
            variant={TableVariant.compact}
            isStickyHeader
          >
            <TableHeader />
            <TableBody />
          </Table>
          {results === 0 && (
            <Card ouiaId={'empty-recommendations'}>
              <CardBody>
                <MessageState
                  title={intl.formatMessage(messages.noMatchingRecommendations)}
                  text={intl.formatMessage(
                    messages.noMatchingRecommendationsDesc
                  )}
                />
              </CardBody>
            </Card>
          )}
        </React.Fragment>
      ) : (
        // ? Welcome to Insights feature for novice clusters with disabled Insights?
        <Card>
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
