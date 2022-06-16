import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import _ from 'lodash';

import { Recommendation } from './Recommendation';
import rule from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY.json';
import ack from '../../../cypress/fixtures/api/insights-results-aggregator/v2/ack/external.rules.rule|ERROR_KEY.json';
import clusterDetails from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';
import { TOTAL_RISK, CATEGORIES } from '../../../cypress/utils/globals';

const defaultPropsRule = {
  isError: false,
  isUninitialized: false,
  isLoading: false,
  isFetching: false,
  isSuccess: true,
  data: rule,
  refetch: undefined,
};

const defaultPropsAck = {
  data: ack,
  isFetching: false,
  refetch: undefined,
};

const defaultPropsClusterDetails = {
  data: clusterDetails.data,
  isFetching: false,
  isSuccess: true,
  refetch: undefined,
};

const ruleDescription = rule.content.description;

const disabledRule = _.cloneDeep(rule);
disabledRule.content.disabled = true;

describe('recommendation page for enabled recommendation with clusters enabled and disabled', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Recommendation
              rule={{ ...defaultPropsRule }}
              ack={{ ...defaultPropsAck, data: undefined }}
              clusters={{ ...defaultPropsClusterDetails }}
              match={{ params: { recommendationId: 'X' } }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('header shows description', () => {
    cy.ouiaType('PF4/Title', 'h1')
      .should(($el) => expect($el.text().trim()).to.equal(ruleDescription))
      .and('have.length', 1);
  });

  it('category labels are displayed', () => {
    cy.get('.categoryLabels').should('have.length', 1);
  });
});

describe('category labels are displayed', () => {
  const tagsCombinations = [
    ['fault_tolerance', 'openshift', 'sap'],
    ['openshift', 'sap'],
    [],
    ['fault_tolerance', 'performance', 'service_availability'],
  ];

  const CATEGORIES_MAP = _.reduce(
    CATEGORIES,
    (obj, value, key) => {
      value.forEach((it) => (obj[it] = key));
      return obj;
    },
    {}
  );

  function tags2categories(tags) {
    return _.filter(_.map(tags, (x) => CATEGORIES_MAP[x]));
  }
  it('at least one tag combination is empty', () => {
    expect(_.map(tagsCombinations, (it) => it.length)).to.include(0);
  });
  it('at least one tag combination is only 1 valid category', () => {
    expect(
      _.map(_.map(tagsCombinations, tags2categories), (it) => it.length)
    ).to.include(1);
  });
  it('at least one tag combination has 0 valid categories', () => {
    expect(
      _.map(_.map(tagsCombinations, tags2categories), (it) => it.length)
    ).to.include(0);
  });
  it('at least one tag combination is >1 valid categories', () => {
    expect(
      _.filter(
        _.map(_.map(tagsCombinations, tags2categories), (it) => it.length),
        (it) => it >= 2
      )
    ).to.have.length.gte(1);
  });

  tagsCombinations.forEach((tags) => {
    describe(`${tags}`, () => {
      const categories = tags2categories(tags);
      const taggedRule = _.cloneDeep(rule);
      taggedRule.content.tags = tags;
      beforeEach(() => {
        mount(
          <MemoryRouter>
            <Intl>
              <Provider store={getStore()}>
                <Recommendation
                  rule={{ ...defaultPropsRule, data: taggedRule }}
                  ack={{ ...defaultPropsAck, data: undefined }}
                  clusters={{ ...defaultPropsClusterDetails }}
                  match={{ params: { recommendationId: 'X' } }}
                />
              </Provider>
            </Intl>
          </MemoryRouter>
        );
      });

      it('page is rendered', () => {
        cy.get('h1').should('have.length', 1);
      });

      if (categories.length > 0) {
        it('tags are displayed', () => {
          if (categories.length > 1) {
            cy.get('.categoryLabels li').should('have.length', 2);
            // if more than 1, expand all
            cy.get('.categoryLabels')
              .contains(`${categories.length - 1} more`)
              .click();
            categories.push('Show Less'); // Show less is displayed
          }

          cy.get('.categoryLabels li')
            .then(($els) => {
              return _.map(Cypress.$.makeArray($els), 'innerText').sort();
            })
            .should('deep.equal', categories.sort());

          // can click on show less
          if (categories.length > 1) {
            cy.get('.categoryLabels')
              .contains('Show Less')
              .click()
              .then(() => {
                cy.get('.categoryLabels li').should('have.length', 2);
              });
          }
        });
      }
    });
  });
});
