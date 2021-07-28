import './_ClusterRules.scss';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { CheckIcon } from '@patternfly/react-icons';
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
import {
  capitalize,
  Card,
  CardBody,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';

import messages from '../../Messages';
import MessageState from '../MessageState/MessageState';
import {
  IMPACT_LABEL,
  LIKELIHOOD_LABEL,
  FILTER_CATEGORIES as FC,
  RULE_CATEGORIES,
} from '../../AppConstants';
import ReportDetails from '../ReportDetails/ReportDetails';

const ClusterRules = ({ reports }) => {
  const intl = useIntl();
  const [activeReports, setActiveReports] = useState([]);
  const [sortBy, setSortBy] = useState({});
  const [filters, setFilters] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [rows, setRows] = useState([]);
  const results = rows ? rows.length / 2 : 0;

  const cols = [
    {
      title: intl.formatMessage(messages.name),
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
            { title: <div> {rule.description}</div> },
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
                        {rule.impact ? IMPACT_LABEL[rule.impact] : 'unknown'} if
                        it occurred.
                      </span>
                    }
                  >
                    <InsightsLabel value={rule.total_risk} />
                  </Tooltip>
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
            };
            if (key === 'category') {
              // in that case, rowValue['category'] is an array of categories (or "tags" in the back-end implementation)
              // e.g. ['security', 'fault_tolerance']
              return rowValue[key].find((categoryName) =>
                filterValues.includes(String(RULE_CATEGORIES[categoryName]))
              );
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

  const filterConfigItems = [
    {
      label: 'name',
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
  ];

  const buildFilterChips = (filters) => {
    const prunedFilters = Object.entries(filters);
    let chips =
      filters && prunedFilters.length > 0
        ? prunedFilters.map((item) => {
            const category = FC[item[0]];
            const chips = item[1].map((value) => ({
              name: category.values.find(
                (values) => values.value === String(value)
              ).label,
              value,
            }));
            return {
              category: capitalize(category.title),
              chips,
              urlParam: category.urlParam,
            };
          })
        : [];
    searchValue.length > 0 &&
      chips.push({
        category: 'Name',
        chips: [{ name: searchValue, value: searchValue }],
      });
    return chips;
  };

  const onChipDelete = (_e, itemsToRemove, isAll) => {
    if (isAll) {
      setRows(buildRows(activeReports, {}, rows, ''));
      setFilters({});
      setSearchValue('');
    } else {
      itemsToRemove.map((item) => {
        if (item.category === 'Name') {
          setRows(buildRows(activeReports, filters, rows, ''));
          setSearchValue('');
        } else {
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
    filters: buildFilterChips(filters),
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
        filterConfig={{ items: filterConfigItems }}
        pagination={
          <React.Fragment>
            {results === 1
              ? `${results} ${intl.formatMessage(messages.recommendation)}`
              : `${results} ${intl.formatMessage(messages.recommendations)}`}
          </React.Fragment>
        }
        activeFiltersConfig={activeFiltersConfig}
      />
      {activeReports.length > 0 ? (
        <React.Fragment>
          <Table
            aria-label={'Cluster recommendations table'}
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
            <Card>
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
