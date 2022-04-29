// FIXME should we use a map here?
const TOTAL_RISK = { Low: 1, Moderate: 2, Important: 3, Critical: 4 };

const CATEGORIES = {
  'Service Availability': ['service_availability'],
  Security: ['security'],
  'Fault Tolerance': ['fault_tolerance'],
  Performance: ['performance'],
};

// TODO remove if unused
// const CATEGORY_MAP = {
//   'Service Availability': 1,
//   Performance: 2,
//   Security: 4,
//   'Fault Tolerance': 3,
// };

// const IMPACT = { Low: 1, Medium: 2, High: 3, Critical: 4 };
// const LIKELIHOOD = { Low: 1, Medium: 2, High: 3, Critical: 4 };

const SORTING_ORDERS = ['ascending', 'descending'];

export { TOTAL_RISK, CATEGORIES, SORTING_ORDERS };
