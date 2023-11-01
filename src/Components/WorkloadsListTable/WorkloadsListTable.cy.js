/* eslint-disable no-unused-vars */
import React from 'react';
import _, { filter } from 'lodash';
import { mount } from '@cypress/react';
import workloads from '../../../cypress/fixtures/api/insights-results-aggregator/v2/workloads.json';
import { WORKLOADS_LIST_COLUMNS } from '../../AppConstants';
import { cumulativeCombinations } from '../../../cypress/utils/combine';
import { TOTAL_RISK } from '../../../cypress/utils/globals';
import { DEFAULT_ROW_COUNT } from '../../../cypress/utils/defaults';
import { passFilterWorkloads } from '../Common/Tables';
import { MemoryRouter } from 'react-router-dom';
import { Intl } from '../../Utilities/intlHelper';
import { Provider } from 'react-redux';
import getStore from '../../Store';
import { WorkloadsListTable } from './WorkloadsListTable';

let values = _.cloneDeep(workloads);
values.forEach(
  (it) =>
    (it.cluster.display_name = it.cluster.display_name
      ? it.cluster.display_name
      : it.cluster.uuid)
);
const data = _.orderBy(
  values,
  [(it) => it.metadata.last_checked_at || '1970-01-01T01:00:00.001Z'],
  ['desc']
);

const ROOT = 'div[id=workloads-list-table]';
const TABLE_HEADERS = _.map(WORKLOADS_LIST_COLUMNS, (it) => it.title);

const DEFAULT_DISPLAYED_SIZE = Math.min(data.length, DEFAULT_ROW_COUNT);

// TODO: test pre-filled search parameters filtration

const TOTAL_RISK_VALUES = Object.keys(TOTAL_RISK);
const TOTAL_RISK_MAP = _.cloneDeep(TOTAL_RISK);

const filtersConf = {
  cluster_name: {
    selectorText: 'Cluster name',
    values: ['Foo', 'Foo Bar', 'Not existing cluster'],
    type: 'input',
    filterFunc: (it, value) =>
      it.cluster_name.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'cluster_name',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  namespace_name: {
    selectorText: 'Namespace name',
    values: ['Foo', 'Foo Bar', 'Not existing namespace'],
    type: 'input',
    filterFunc: (it, value) =>
      it.namespace_name.toLowerCase().includes(value.toLowerCase()),
    urlParam: 'namespace_name',
    urlValue: (it) => it.replace(/ /g, '+'),
  },
  general_severity: {
    selectorText: 'Severity',
    values: Array.from(cumulativeCombinations(TOTAL_RISK_VALUES)),
    type: 'checkbox',
    filterFunc: (it, value) => {
      for (const risk of _.map(value, (x) => TOTAL_RISK_MAP[x])) {
        if (risk === '' || it.hits_by_total_risk[risk] > 0) return true;
      }
      return false;
    },
    urlParam: 'general_severity',
    urlValue: (it) =>
      encodeURIComponent(_.map(it, (x) => TOTAL_RISK_MAP[x]).join(',')),
  },
};

const NO_FILTERS = {};

const filterDataWithoutFiltersApplied = workloads.filter((workloadData) => {
  return passFilterWorkloads(workloadData, NO_FILTERS);
});
const applyFilters = (filters) => {
  return workloads.filter((workloadData) => {
    return passFilterWorkloads(workloadData, filters);
  });
};

describe('data', () => {
  it('has values', () => {
    expect(filterDataWithoutFiltersApplied).to.have.length.gt(1);
  });
  it('has more entries than default pagination', () => {
    expect(filterDataWithoutFiltersApplied).to.have.length.gt(
      DEFAULT_ROW_COUNT
    );
  });
  it('at least one namespace has a cluster name', () => {
    expect(
      _.filter(filterDataWithoutFiltersApplied, (it) => it.cluster.display_name)
    ).to.have.length.gte(1);
  });
  it('data contains at least one namespace without clustername', () => {
    expect(
      _.filter(
        filterDataWithoutFiltersApplied,
        (it) => it.cluster.display_name === ''
      )
    ).to.have.length.gte(1);
  });
  it('at least one entry has last seen', () => {
    expect(
      _.filter(
        filterDataWithoutFiltersApplied,
        (it) => it.metadata.last_checked_at
      )
    ).to.have.length.gte(1);
  });
  it('at least one entry does not have last seen', () => {
    expect(
      _.filter(
        filterDataWithoutFiltersApplied,
        (it) => it.metadata.last_checked_at === ''
      )
    ).to.have.length.gte(1);
  });
  it('at least two clusters match foo for their names', () => {
    expect(applyFilters({ display_name: 'foo clustername' })).to.have.length.gt(
      1
    );
  });
  it('at least one namespace matches foo bar in the name of the namespace', () => {
    expect(applyFilters({ name: 'foo bar namespace' })).to.have.length.gt(1);
  });
});

describe('workloads list "No workload recommendations" Empty state rendering', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/workloads']}
        initialIndex={0}
      >
        <Intl>
          <Provider store={getStore()}>
            <WorkloadsListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: [],
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders the Empty State component', () => {
    cy.get('div[class=pf-c-empty-state__content]')
      .should('have.length', 1)
      .find('h5')
      .should('have.text', 'No workload recommendations');
    cy.get('div[class=pf-c-empty-state__body] p').should(
      'have.text',
      'There are no workload-related recommendations for your clusters. This page only shows workloads if there are recommendations available.'
    );
    cy.get('div[class=pf-c-empty-state__body] button').should(
      'have.text',
      'Return to previous page'
    );
    cy.get('div[id=workloads-list-table]').should('not.exist');
  });
});

describe('workloads list "Workloads data unavailable" Empty state rendering', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter
        initialEntries={['/openshift/insights/advisor/workloads']}
        initialIndex={0}
      >
        <Intl>
          <Provider store={getStore()}>
            <WorkloadsListTable
              query={{
                isError: true,
                error: { status: 404 },
                isFetching: false,
                isUninitialized: false,
                isSuccess: false,
                data: [],
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders the Empty State component', () => {
    cy.get('div[class=pf-c-empty-state__content]')
      .should('have.length', 1)
      .find('h5')
      .should('have.text', 'Workloads data unavailable');
    cy.get('div[class=pf-c-empty-state__body] p').should(
      'have.text',
      'Verify that your clusters are connected and sending data to Red Hat, and that the Deployment Validation Operator is installed and configured.'
    );
    cy.get('div[class=pf-c-empty-state__body] button').should(
      'have.text',
      'Return to previous page'
    );
    cy.get('div[class=pf-c-empty-state__body] a').should(
      'have.text',
      'View documentation'
    );
    cy.get('div[id=workloads-list-table]').should('not.exist');
  });
});
