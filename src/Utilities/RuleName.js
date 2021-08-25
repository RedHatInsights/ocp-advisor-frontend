const getPluginName = (rule) => rule.split('|')?.[0];
const getErrorKey = (rule) => rule.split('|')?.[1];

export { getPluginName, getErrorKey };
