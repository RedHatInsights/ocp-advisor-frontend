import {
  capitalize,
  createChips,
  pruneWorkloadsRulesFilters,
  switchSort,
  sortWithSwitch,
  workloadsRulesRemoveFilterParam,
  workloadsRulesAddFilterParam,
  passFilterWorkloadsRecs,
} from '../../Utilities/Workloads';

describe('capitalize function', () => {
  it('capitalizes the first letter of a string', () => {
    expect(capitalize('test')).toBe('Test');
    expect(capitalize('hello')).toBe('Hello');
  });
});

describe('createChips function', () => {
  it('creates chips with the correct format', () => {
    const category = {
      values: [
        { label: 'Label 1', value: '1' },
        { label: 'Label 2', value: '2' },
      ],
    };

    expect(createChips(category, '1')).toEqual({ name: 'Label 1', value: '1' });
    expect(createChips(category, '3')).toEqual({ name: '3', value: '3' });
  });
});

describe('pruneWorkloadsRulesFilters function', () => {
  it('prunes filters correctly', () => {
    const localFilters = {
      limit: 50,
      sortIndex: 1,
      sortDirection: 'desc',
      description: 'Sample Description',
      total_risk: [1, 2],
      object_id: '12345',
      object_name: 'name name',
    };

    const filterCategories = {
      description: { label: 'Description', urlParam: 'description' },
      total_risk: {
        label: 'Total Risk',
        urlParam: 'total_risk',
        values: [
          { label: 'Critical', value: '4' },
          { label: 'Important', value: '3' },
          { label: 'Moderate', value: '2' },
          { label: 'Low', value: '1' },
        ],
      },
      object_id: { label: 'Object ID', urlParam: 'object_id' },
      object_name: { label: 'Object name', urlParam: 'object_name' },
    };

    const result = pruneWorkloadsRulesFilters(localFilters, filterCategories);

    expect(result).toEqual([
      {
        category: 'Description',
        chips: [{ name: 'Sample Description', value: 'Sample Description' }],
        urlParam: 'description',
      },
      {
        category: 'Total Risk',
        chips: [
          { name: 'Low', value: 1 },
          { name: 'Moderate', value: 2 },
        ],
        urlParam: 'total_risk',
      },
      {
        category: 'Object ID',
        chips: [{ name: '12345', value: '12345' }],
        urlParam: 'object_id',
      },
      {
        category: 'Object name',
        chips: [{ name: 'name name', value: 'name name' }],
        urlParam: 'object_name',
      },
    ]);
  });
});

// Mocking SortByDirection for testing purposes
const SortByDirection = {
  asc: 'asc',
  desc: 'desc',
};

describe('switchSort function', () => {
  test('should return details for sortIndex 1', () => {
    const item = [{ rule: { details: 'someDetails' } }];
    const result = switchSort(1, item);
    expect(result).toBe('someDetails');
  });

  test('should return total_risk for sortIndex 2', () => {
    const item = [{ rule: { total_risk: 42 } }];
    const result = switchSort(2, item);
    expect(result).toBe(42);
  });

  test('should return objects length for sortIndex 3', () => {
    const item = [{ rule: { objects: [1, 2, 3] } }];
    const result = switchSort(3, item);
    expect(result).toBe(3);
  });

  test('should return modified for sortIndex 4', () => {
    const item = [{ rule: { modified: '2024-01-10' } }];
    const result = switchSort(4, item);
    expect(result).toBe('2024-01-10');
  });
});

describe('sortWithSwitch function', () => {
  test('should return original rows if sortIndex is invalid or firstRule is true', () => {
    const filteredRows = [{ rule: { details: 'abc' } }];
    const result = sortWithSwitch(5, SortByDirection.asc, filteredRows, false);
    expect(result).toEqual(filteredRows);
  });

  test('should sort rows in ascending order based on switchSort', () => {
    const filteredRows = [
      [{ rule: { details: 'abc' } }],
      [{ rule: { details: 'xyz' } }],
    ];
    const result = sortWithSwitch(1, SortByDirection.asc, filteredRows);
    expect(result).toEqual([
      [{ rule: { details: 'abc' } }],
      [{ rule: { details: 'xyz' } }],
    ]);
  });

  test('should sort rows in descending order based on switchSort', () => {
    const filteredRows = [
      [{ rule: { details: 'abc' } }],
      [{ rule: { details: 'xyz' } }],
    ];
    const result = sortWithSwitch(1, SortByDirection.desc, filteredRows);
    expect(result).toEqual([
      [{ rule: { details: 'xyz' } }],
      [{ rule: { details: 'abc' } }],
    ]);
  });
});

describe('workloadsRulesRemoveFilterParam', () => {
  it('should remove the specified filter param', () => {
    const currentFilters = {
      description: 'example',
      total_risk: [],
      object_id: '123',
    };
    const updateFiltersMock = jest.fn();

    workloadsRulesRemoveFilterParam(
      currentFilters,
      updateFiltersMock,
      'description'
    );

    expect(updateFiltersMock).toHaveBeenCalledWith({
      total_risk: [],
      object_id: '123',
      description: '',
    });
  });

  it('should remove the total_risk filter param', () => {
    const currentFilters = {
      description: 'example',
      total_risk: [1, 2, 3],
      object_id: '123',
    };
    const updateFiltersMock = jest.fn();

    workloadsRulesRemoveFilterParam(
      currentFilters,
      updateFiltersMock,
      'total_risk'
    );

    expect(updateFiltersMock).toHaveBeenCalledWith({
      description: 'example',
      object_id: '123',
      total_risk: [],
    });
  });

  it('should remove the object_name filter param', () => {
    const currentFilters = {
      description: 'example',
      object_id: '123',
      object_name: 'name of an object',
    };
    const updateFiltersMock = jest.fn();

    workloadsRulesRemoveFilterParam(
      currentFilters,
      updateFiltersMock,
      'object_name'
    );

    expect(updateFiltersMock).toHaveBeenCalledWith({
      description: 'example',
      object_id: '123',
      object_name: '',
    });
  });
});

describe('workloadsRulesAddFilterParam', () => {
  it('should add values to the specified filter param', () => {
    const currentFilters = {
      description: 'example',
      total_risk: [],
      object_id: '123',
    };
    const updateFiltersMock = jest.fn();

    workloadsRulesAddFilterParam(
      currentFilters,
      updateFiltersMock,
      'total_risk',
      [1, 2, 3]
    );

    expect(updateFiltersMock).toHaveBeenCalledWith({
      description: 'example',
      object_id: '123',
      total_risk: [1, 2, 3],
    });
  });

  it('should remove the filter param if values are empty', () => {
    const currentFilters = {
      description: 'example',
      total_risk: [1, 2, 3],
      object_id: '123',
    };
    const updateFiltersMock = jest.fn();

    workloadsRulesAddFilterParam(
      currentFilters,
      updateFiltersMock,
      'total_risk',
      []
    );

    expect(updateFiltersMock).toHaveBeenCalledWith({
      description: 'example',
      object_id: '123',
      total_risk: [],
    });
  });
});

describe('passFilterWorkloadsRecs', () => {
  const recommendation = {
    details: 'Sample details',
    objects: [{ uid: 'abc', display_name: 'object_name' }],
    total_risk: 2,
  };

  it('should return true with empty filters', () => {
    const filters = {};
    const result = passFilterWorkloadsRecs(recommendation, filters);
    expect(result).toBe(true);
  });

  it('should filter based on description', () => {
    const filters = { description: 'sample' };
    const result = passFilterWorkloadsRecs(recommendation, filters);
    expect(result).toBe(true);
  });

  it('should filter based on object_id', () => {
    const filters = { object_id: 'abc' };
    const result = passFilterWorkloadsRecs(recommendation, filters);
    expect(result).toBe(true);
  });

  it('should filter based on total_risk', () => {
    const filters = { total_risk: ['2'] };
    const result = passFilterWorkloadsRecs(recommendation, filters);
    expect(result).toBe(true);
  });

  it('should return false with non-matching filters', () => {
    const filters = { description: 'nonexistent', object_id: 'xyz' };
    const result = passFilterWorkloadsRecs(recommendation, filters);
    expect(result).toBe(false);
  });

  it('should handle empty string filters', () => {
    const filters = { description: '' };
    const result = passFilterWorkloadsRecs(recommendation, filters);
    expect(result).toBe(true); // Empty string filter should be ignored
  });

  it('should filter based on object_name', () => {
    const filters = { object_name: 'object_name' };
    const result = passFilterWorkloadsRecs(recommendation, filters);
    expect(result).toBe(true);
  });

  it('should filter based on object_name if object name is partially written', () => {
    const filters = { object_name: 'object_n' };
    const result = passFilterWorkloadsRecs(recommendation, filters);
    expect(result).toBe(true);
  });
});
