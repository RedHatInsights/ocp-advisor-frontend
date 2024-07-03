import { SortByDirection } from '@patternfly/react-table';
import _ from 'lodash';

export const SEVERITY_OPTIONS = [
  {
    value: 'critical',
    label: 'Critical',
    iconColor: 'var(--pf-global--danger-color--100)',
    textColor: 'var(--pf-global--danger-color--100)',
    hasIcon: true,
    indexNumber: 4,
  },
  {
    value: 'important',
    label: 'Important',
    iconColor: 'var(--pf-global--palette--orange-300)',
    textColor: 'var(--pf-global--palette--orange-400)',
    hasIcon: true,
    indexNumber: 3,
  },
  {
    value: 'moderate',
    label: 'Moderate',
    iconColor: 'var(--pf-global--warning-color--100)',
    textColor: 'var(--pf-global--warning-color--200)',
    hasIcon: true,
    indexNumber: 2,
  },
  {
    value: 'low',
    label: 'Low',
    iconColor: 'var(--pf-global--Color--200)',
    textColor: 'var(--pf-global--default-color--300)',
    hasIcon: true,
    indexNumber: 1,
  },
];

export const remappingSeverity = (obj, mode) => {
  const mapping = {
    1: 'low',
    2: 'moderate',
    3: 'important',
    4: 'critical',
  };
  let updatedObj = {};

  if (mode === 'general' || mode === 'label') {
    for (const key in obj) {
      if (key in mapping) {
        updatedObj[mapping[key]] = obj[key];
      }
    }
  } else {
    updatedObj = mapping[obj];
  }

  return updatedObj;
};

export const hasAnyValueGreaterThanZero = (obj, stringsToCheck) => {
  for (const key of stringsToCheck) {
    if (obj[key] > 0) {
      return true; // Return true if any matching string has a value greater than 0
    }
  }
};

export const severityTypeToText = (value) => {
  value = parseInt(value);
  if (value === 1) {
    return 'Low';
  } else if (value === 2) {
    return 'Moderate';
  } else if (value === 3) {
    return 'Important';
  } else {
    return 'Critical';
  }
};

export const filtersAreApplied = (params) => {
  const cleanedUpParams = _.cloneDeep(params);
  delete cleanedUpParams.sortIndex;
  delete cleanedUpParams.sortDirection;
  delete cleanedUpParams.offset;
  delete cleanedUpParams.limit;
  delete cleanedUpParams.sort;
  return Object.values(cleanedUpParams).filter((value) => !_.isEmpty(value))
    .length
    ? true
    : false;
};

export const capitalize = (str) => {
  return str?.charAt(0).toUpperCase() + str?.slice(1);
};

export const createChips = (category, value) => {
  if (category.values) {
    const selectedCategoryValue = category.values.find(
      (values) => values.value === String(value)
    );

    return selectedCategoryValue
      ? {
          name: selectedCategoryValue.label || selectedCategoryValue.text,
          value,
        }
      : { name: value, value };
  }

  return { name: value, value };
};

export const pruneWorkloadsRulesFilters = (localFilters, filterCategories) => {
  const prunedFilters = Object.entries(localFilters);
  return prunedFilters.reduce((arr, [name, value]) => {
    if (filterCategories[name]) {
      const category = filterCategories[name];
      if (
        (Array.isArray(value) && value.length > 0) ||
        (typeof value === 'string' && value.trim() !== '')
      ) {
        const chips = Array.isArray(value)
          ? value.map((v) => createChips(category, v))
          : [createChips(category, value)];

        arr.push({
          category: capitalize(category.label),
          chips,
          urlParam: category.urlParam,
        });
      }
    } else if (
      (name === 'description' ||
        name === 'object_id' ||
        name === 'display_name') &&
      value.trim() !== ''
    ) {
      arr.push({
        category: capitalize(name.replace('_', ' ')),
        chips: [{ name: value, value }],
        urlParam: name,
      });
    }

    return arr;
  }, []);
};

export const switchSort = (sortIndex, item) => {
  const rule = item[0].rule;
  switch (sortIndex) {
    case 1:
      return rule.details;
    case 2:
      return rule.total_risk;
    case 3:
      return rule.objects.length;
    case 4:
      return rule.modified;
  }
};

export const sortWithSwitch = (sortIndex, sortDirection, filteredRows) => {
  return sortIndex >= 1
    ? [...filteredRows]?.sort((a, b) => {
        const d = sortDirection === SortByDirection.asc ? 1 : -1;
        return switchSort(sortIndex, a) > switchSort(sortIndex, b)
          ? d
          : switchSort(sortIndex, b) > switchSort(sortIndex, a)
          ? -d
          : 0;
      })
    : [...filteredRows];
};

export const flatMapRows = (filteredRows, expandFirst) => {
  return filteredRows.flatMap((row, index) => {
    const updatedRow = [...row];
    if (expandFirst && index === 0) {
      row[0].isOpen = true;
    }
    row[1].parent = index * 2;
    return updatedRow;
  });
};

export const passObjectsFilters = (objects, filters) => {
  console.log(filters);
  const cleanedUpFilters = _.omitBy(_.cloneDeep(filters), _.isEmpty);
  return Object.entries(cleanedUpFilters).every(([filterKey, filterValue]) => {
    switch (filterKey) {
      case 'display_name':
        return (
          filterValue &&
          objects.display_name.toLowerCase().includes(filterValue.toLowerCase())
        );
      case 'object_id':
        return (
          filterValue &&
          objects.uid.toLowerCase().includes(filterValue.toLowerCase())
        );
      /* case 'object_id':
        return objects.uid.toLowerCase().includes(filterValue.toLowerCase());
      case 'display_name':
        return objects.display_name
          .toLowerCase()
          .includes(filterValue.toLowerCase()); */
      default:
        return true;
    }
  });
};

export const workloadsRulesRemoveFilterParam = (
  currentFilters,
  updateFilters,
  param
) => {
  const { [param]: omitted, ...newFilters } = { ...currentFilters };
  updateFilters({
    ...newFilters,
    ...(param === 'description'
      ? { description: '' }
      : param === 'total_risk'
      ? { total_risk: [] }
      : param === 'object_id'
      ? { object_id: '' }
      : {}),
  });
};

export const workloadsRulesAddFilterParam = (
  currentFilters,
  updateFilters,
  param,
  values
) =>
  values.length > 0
    ? updateFilters({
        ...currentFilters,
        ...{ [param]: values },
      })
    : workloadsRulesRemoveFilterParam(currentFilters, updateFilters, param);

export const passFilterWorkloadsRecs = (recommendation, filters) => {
  const cleanedUpFilters = _.omitBy(_.cloneDeep(filters), _.isEmpty);

  return Object.entries(cleanedUpFilters).every(([filterKey, filterValue]) => {
    switch (filterKey) {
      case 'description':
        return (
          filterValue &&
          recommendation.details
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        );
      case 'object_id':
        return (
          filterValue &&
          recommendation.objects.some((obj) =>
            obj.uid.toLowerCase().includes(filterValue.toLowerCase())
          )
        );
      case 'total_risk':
        return (
          filterValue && filterValue.includes(String(recommendation.total_risk))
        );
      default:
        return true;
    }
  });
};
