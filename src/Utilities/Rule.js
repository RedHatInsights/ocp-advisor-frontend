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
    impact: adjusted.impact,
  };
  delete adjusted.metadata;
  delete adjusted.error_keys;
  return adjusted;
};

export { getPluginName, getErrorKey, adjustOCPRule };
