import { passObjectsFilters } from '../../Utilities/Workloads';
import mockObjects from '../../../cypress/fixtures/api/insights-results-aggregator/objects.json';

const filters = {
  limit: 50,
  offset: 0,
};
const buildFilteredRows = (allrows, filters) => {
  return allrows.filter((object) => passObjectsFilters(object, filters));
};

describe('buildFilteredRows', () => {
  it('should filter objects based on the provided filters', () => {
    const filterWithText = {
      ...filters,
      object_id: 'foobar',
    };

    const filteredRows = buildFilteredRows(mockObjects, filterWithText);

    const expectedObjects = [
      {
        kind: 'Deployment',
        uid: 'foobar',
      },
    ];

    expect(filteredRows).toEqual(expectedObjects);
  });

  it('should not filter any objects when filters are empty', () => {
    const noFilter = {
      ...filters,
      object_id: '',
    };
    const filteredRows = buildFilteredRows(mockObjects, noFilter);

    expect(filteredRows).toEqual(mockObjects);
  });
});
