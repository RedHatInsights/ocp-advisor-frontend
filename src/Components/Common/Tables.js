import { FILTER_CATEGORIES, RULE_CATEGORIES } from '../../AppConstants';

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

export { passFilters };
