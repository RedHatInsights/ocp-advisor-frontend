import React from 'react';
import { Link } from 'react-router-dom';

import { Tooltip } from '@patternfly/react-core/dist/js/components/Tooltip';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';

import {
  CLUSTER_FILTER_CATEGORIES,
  FILTER_CATEGORIES,
  intl,
  RULE_CATEGORIES,
} from '../../AppConstants';
import messages from '../../Messages';

const passFilters = (rule, filters) =>
  Object.entries(filters).every(([filterKey, filterValue]) => {
    switch (filterKey) {
      case 'text':
        return rule.description
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      case FILTER_CATEGORIES.total_risk.urlParam:
        return filterValue.includes(String(rule.total_risk));
      case FILTER_CATEGORIES.category.urlParam:
        return rule.tags.find((c) =>
          filterValue.includes(String(RULE_CATEGORIES[c]))
        );
      case FILTER_CATEGORIES.impact.urlParam:
        return filterValue.includes(String(rule.impact));
      case FILTER_CATEGORIES.impacting.urlParam:
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
      case FILTER_CATEGORIES.likelihood.urlParam:
        return filterValue.includes(String(rule.likelihood));
      case FILTER_CATEGORIES.rule_status.urlParam:
        return (
          filterValue === 'all' ||
          (filterValue === 'disabled' && rule.disabled) ||
          (filterValue === 'enabled' && !rule.disabled)
        );
      default:
        return true;
    }
  });

const passFiltersCluster = (cluster, filters) =>
  Object.entries(filters).every(([filterKey, filterValue]) => {
    switch (filterKey) {
      case 'text':
        return (cluster.cluster_name || cluster.cluster_id)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      case CLUSTER_FILTER_CATEGORIES.hits.urlParam:
        return (
          // clusters with at least one rule hit
          (filterValue.length === 0 && parseInt(cluster.total_hit_count) > 0) ||
          // all clusters
          filterValue.includes('all') ||
          // clusters with at least one rule hit for any of the active risk filters
          filterValue.some((v) => cluster.hits_by_total_risk[v - 1] > 0)
        );
      default:
        return true;
    }
  });

const mapClustersToRows = (clusters) =>
  clusters.map((c, i) => ({
    cluster: c,
    cells: [
      <span key={i}>
        <Link to={`clusters/${c.cluster_id}`}>
          {c.cluster_name || c.cluster_id}
        </Link>
      </span>,
      c.total_hit_count,
      c.hits_by_total_risk?.[3] || 0,
      c.hits_by_total_risk?.[2] || 0,
      c.hits_by_total_risk?.[1] || 0,
      c.hits_by_total_risk?.[0] || 0,
      <span key={i}>
        {c.last_checked_at ? (
          <DateFormat
            extraTitle={`${intl.formatMessage(messages.lastSeen)}: `}
            date={c.last_checked_at}
            variant="relative"
          />
        ) : (
          <Tooltip
            key={i}
            content={
              <span>
                {intl.formatMessage(messages.lastSeen) + ': '}
                {intl.formatMessage(messages.nA)}
              </span>
            }
          >
            <span>{intl.formatMessage(messages.nA)}</span>
          </Tooltip>
        )}
      </span>,
    ],
  }));

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

const buildFilterChips = (filters, categories) => {
  const localFilters = { ...filters };
  delete localFilters.sortIndex;
  delete localFilters.sortDirection;
  delete localFilters.offset;
  delete localFilters.limit;
  localFilters?.hits &&
    localFilters.hits.length === 0 &&
    delete localFilters.hits;
  return pruneFilters(localFilters, categories);
};

export { passFilters, passFiltersCluster, mapClustersToRows, buildFilterChips };
