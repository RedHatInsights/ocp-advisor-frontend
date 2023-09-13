// FIXME should we use a map here?
const TOTAL_RISK = { Low: 1, Moderate: 2, Important: 3, Critical: 4 };

const CATEGORIES = {
  'Service Availability': ['service_availability'],
  Security: ['security'],
  'Fault Tolerance': ['fault_tolerance'],
  Performance: ['performance'],
  'Best Practice': ['best_practice'],
};

const SORTING_ORDERS = ['ascending', 'descending'];

export { TOTAL_RISK, CATEGORIES, SORTING_ORDERS };
