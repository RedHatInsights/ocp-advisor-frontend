import { IMPACT_VALUES } from '../AppConstants';

const getPluginName = (rule) => rule.split('|')?.[0];
const getErrorKey = (rule) => rule.split('|')?.[1];
// workaround. Should be removed when https://issues.redhat.com/browse/CCXDEV-5534 is done.
const adjustOCPRule = (rule, recId) => {
  const errorKeyContent = rule?.error_keys?.[getErrorKey(recId)] || {};
  const adjusted = {
    ...rule,
    ...errorKeyContent,
    ...(errorKeyContent?.metadata || rule?.metadata || {}),
  };
  adjusted.impact = {
    // ! FIX BEFORE PATCH PUBLISH
    name: '',
    impact: 1,
  };
  adjusted.impacted_systems_count = 1;
  adjusted.impacted_clusters_count = 1;
  delete adjusted.metadata;
  delete adjusted.error_keys;
  return adjusted;
};

export { getPluginName, getErrorKey, adjustOCPRule };
