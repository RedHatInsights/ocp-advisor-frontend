import capitalize from 'lodash/capitalize';
import cloneDeep from 'lodash/cloneDeep';
import { useEffect, useState } from 'react';
import { coerce, compare, valid } from 'semver';
import {
  CLUSTER_FILTER_CATEGORIES,
  FILTER_CATEGORIES,
  RULE_CATEGORIES,
} from '../../AppConstants';
import {
  hasAnyValueGreaterThanZero,
  remappingSeverity,
} from '../../Utilities/Workloads';

export const passFilters = (rule, filters) =>
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
      case FILTER_CATEGORIES.res_risk.urlParam:
        return filterValue.includes(String(rule.resolution_risk));
      default:
        return true;
    }
  });

export const passFiltersCluster = (cluster, filters) =>
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
          filterValue.some((v) => cluster.hits_by_total_risk[v] > 0)
        );
      case 'version':
        return (
          filterValue.length === 0 ||
          filterValue.includes(toValidSemVer(cluster.cluster_version))
        );
      default:
        return true;
    }
  });

const pruneFilters = (localFilters, filterCategories) => {
  const prunedFilters = Object.entries(localFilters || {});
  return prunedFilters.reduce((arr, it) => {
    const [key, item] = it;
    if (filterCategories[key]) {
      const category = filterCategories[key];
      const chips = Array.isArray(item)
        ? item.map((value) => {
            const selectedCategoryValue = category.values.find(
              (values) => values.value === String(value)
            );
            return selectedCategoryValue
              ? {
                  name:
                    selectedCategoryValue.text || selectedCategoryValue.label,
                  value,
                }
              : { name: value, value };
          })
        : [
            {
              name: category.values.find(
                (values) => values.value === String(item)
              ).label,
              value: item,
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
    } else if (key === 'text') {
      return [
        ...arr,
        ...(item.length > 0
          ? [
              {
                category: 'Name',
                chips: [{ name: item, value: item }],
                urlParam: key,
              },
            ]
          : []),
      ];
    } else if (key === 'version') {
      return [
        ...arr,
        ...(item.length > 0
          ? [
              {
                category: 'Version',
                chips: item.map((it) => ({
                  name: it,
                  value: it,
                })),
                urlParam: key,
              },
            ]
          : []),
      ];
    } else if (key === 'namespace_name') {
      return [
        ...arr,
        ...(item.length > 0
          ? [
              {
                category: 'Namespace name',
                chips: [{ name: item, value: item }],
                urlParam: key,
              },
            ]
          : []),
      ];
    } else if (key === 'cluster_name') {
      return [
        ...arr,
        ...(item.length > 0
          ? [
              {
                category: 'Cluster name',
                chips: [{ name: item, value: item }],
                urlParam: key,
              },
            ]
          : []),
      ];
    }
  }, []);
};

export const buildFilterChips = (filters, categories) => {
  const localFilters = cloneDeep(filters);
  delete localFilters.sortIndex;
  delete localFilters.sortDirection;
  delete localFilters.sort;
  delete localFilters.offset;
  delete localFilters.limit;
  localFilters?.hits &&
    localFilters.hits.length === 0 &&
    delete localFilters.hits;
  return pruneFilters(localFilters, categories);
};

// parses url params for use in table/filter chips
export const paramParser = (search) => {
  const searchParams = new URLSearchParams(search);
  return Array.from(searchParams).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: [
        'text',
        'first',
        'rule_status',
        'sort',
        'cluster_name',
        'namespace_name',
      ].includes(key)
        ? value // just copy the full value
        : value === 'true' || value === 'false'
        ? JSON.parse(value) // parse boolean
        : // parse array of values
          value.split(','),
    }),
    {}
  );
};

export const translateSortParams = (value) => ({
  name: value.substring(value.startsWith('-') ? 1 : 0),
  direction: value.startsWith('-') ? 'desc' : 'asc',
});

export const translateSortValue = (index, indexMapping, direction) => {
  if (!['desc', 'asc'].includes(direction)) {
    console.error('Invalid sort parameters (is not asc nor desc)');
  }
  return `${direction === 'asc' ? '' : '-'}${indexMapping[index]}`;
};

// TODO: remove since unused
export const debounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [delay, value]);

  return debouncedValue;
};

export const updateSearchParams = (filters = {}, columnMapping) => {
  const url = new URL(window.location.origin + window.location.pathname);
  // separately check the sort param
  url.searchParams.set(
    'sort',
    translateSortValue(filters.sortIndex, columnMapping, filters.sortDirection)
  );
  // check the rest of filters
  Object.entries(filters).forEach(([key, value]) => {
    return (
      key !== 'sortIndex' &&
      key !== 'sortDirection' &&
      key !== 'sort' &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0) &&
      url.searchParams.set(key, value)
    );
  });
  window.history.replaceState(null, null, url.href);
};

// TODO: move to Utils.js
export const compareSemVer = (v1, v2, d) => d * compare(v1, v2);
export const toValidSemVer = (version) =>
  coerce(version === undefined || !valid(coerce(version)) ? '0.0.0' : version)
    .version;

export const removeFilterParam = (currentFilters, updateFilters, param) => {
  const { [param]: omitted, ...newFilters } = { ...currentFilters, offset: 0 };
  updateFilters({
    ...newFilters,
    ...(param === 'text'
      ? { text: '' }
      : param === 'hits'
      ? { hits: [] }
      : param === 'version'
      ? { version: [] }
      : {}),
  });
};

export const addFilterParam = (currentFilters, updateFilters, param, values) =>
  values.length > 0
    ? updateFilters({
        ...currentFilters,
        offset: 0,
        ...{ [param]: values },
      })
    : removeFilterParam(currentFilters, updateFilters, param);

export const passFilterWorkloads = (workloads, filters) => {
  const generalSeverityRemapped = remappingSeverity(
    workloads.metadata.hits_by_severity,
    'general'
  );
  return Object.entries(filters).every(([filterKey, filterValue]) => {
    switch (filterKey) {
      case 'cluster_name':
        return (workloads.cluster.display_name || workloads.cluster.uuid)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      case 'namespace_name':
        return (workloads.namespace.name || workloads.namespace.uuid)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      case 'severity':
        return (
          filterValue.length === 0 ||
          hasAnyValueGreaterThanZero(generalSeverityRemapped, filters.severity)
        );
      default:
        return true;
    }
  });
};
