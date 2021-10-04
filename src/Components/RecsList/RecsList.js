import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import {
  cellWidth,
  sortable,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';

import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { InsightsLabel } from '@redhat-cloud-services/frontend-components/InsightsLabel';
import { Main } from '@redhat-cloud-services/frontend-components/Main';

import {
  FILTER_CATEGORIES as FC,
  RISK_OF_CHANGE_LABEL,
  TOTAL_RISK_LABEL_LOWER,
} from '../../AppConstants';
import { useLazyGetRecsQuery } from '../../Services/SmartProxy';
import messages from '../../Messages';
import { updateRecsListFilters as updateFilters } from '../../Services/Filters';
import { Link } from 'react-router-dom';
import RuleLabels from '../RuleLabels/RuleLabels';
import {
  Button,
  Stack,
  StackItem,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';
import { strong } from '../../Utilities/intlHelper';
import RuleDetails from '../Recommendation/RuleDetails';

const RecsList = () => {
  const intl = useIntl();
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
  const perPage = Number(filters.limit);
  const page = filters.offset / filters.limit + 1;
  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [cols] = useState([
    {
      title: intl.formatMessage(messages.name),
      transforms: [sortable, cellWidth(40)],
    },
    {
      title: intl.formatMessage(messages.added),
      transforms: [sortable, cellWidth(10)],
    },
    {
      title: intl.formatMessage(messages.totalRisk),
      transforms: [sortable, cellWidth(15)],
    },
    {
      title: intl.formatMessage(messages.riskOfChange),
      transforms: [sortable, cellWidth(15)],
    },
    {
      title: intl.formatMessage(messages.clusters),
      transforms: [sortable, cellWidth(15)],
    },
  ]);

  const refresh = () => {
    trigger();
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const newFilteredRows = buildFilteredRows(rows, filters);
    const newDisplayedRows = buildDisplayedRows(newFilteredRows);
    // const newChips = updateNameChip(chips, filters.text);
    setFilteredRows(newFilteredRows);
    setDisplayedRows(newDisplayedRows);
    // setChips(newChips);
  }, [result]);

  // constructs array of rows (from the initial data) checking currently applied filters
  const buildFilteredRows = (allRows) =>
    allRows.flatMap((value, key) => [
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
              'N/A'
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
                    'N/A'
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
                  'N/A'
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
                  : 'N/A'
              }`}</div>
            ),
          },
        ],
      },
      {
        parent: key * 2,
        fullWidth: true,
        cells: [
          {
            title: (
              <Main className="pf-m-light">
                <Stack hasGutter>
                  <RuleDetails isOpenShift rule={value} />
                </Stack>
              </Main>
            ),
          },
        ],
      },
    ]);

  const buildDisplayedRows = (rows) => {
    return rows.slice(perPage * (page - 1), perPage * (page - 1) + perPage);
  };

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    delete filter[param];
    updateFilters({ ...filter, ...(param === 'text' ? { text: '' } : {}) });
  };

  const addFilterParam = (param, values) => {
    values.length > 0
      ? updateFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param);
  };

  const toggleRulesDisabled = (rule_status) => {
    updateFilters({
      ...filters,
      rule_status,
      offset: 0,
      ...(rule_status !== 'enabled' && { impacting: ['false'] }),
    });
  };

  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) => updateFilters({ ...filters, text: value }),
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

  return (
    <React.Fragment>
      {isSuccess && (
        <Table
          aria-label="Table of recommendations"
          ouiaId="recsListTable"
          variant={TableVariant.compact}
          cells={cols}
          rows={filteredRows}
        >
          <TableHeader />
          <TableBody />
        </Table>
      )}
    </React.Fragment>
  );
};

export default RecsList;
