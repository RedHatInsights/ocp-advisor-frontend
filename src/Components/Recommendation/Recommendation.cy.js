import React from 'react';

import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import _ from 'lodash';

import { Recommendation } from './Recommendation';
import rule from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY.json';
import ack from '../../../cypress/fixtures/api/insights-results-aggregator/v2/ack/external.rules.rule|ERROR_KEY.json';
import clusterDetails from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';
import { CATEGORIES } from '../../../cypress/utils/globals';
import { TBODY, ROW } from '../../../cypress/utils/components';
import { TITLE } from '@redhat-cloud-services/frontend-components-utilities';

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
const nulledResolutionRisk = _.cloneDeep(rule);
nulledResolutionRisk.content.resolution_risk = 0;

// TODO: test data

describe('recommendation page for enabled recommendation with clusters enabled and disabled', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Recommendation
              rule={{ ...defaultPropsRule }}
              ack={{ ...defaultPropsAck, data: undefined }}
              clusters={{ ...defaultPropsClusterDetails }}
              recId="X"
            />
          </Provider>
        </Intl>
      </MemoryRouter>,
    );

    cy.intercept('POST', '/api/insights-results-aggregator/v2/ack', {
      statusCode: 201,
    }).as('ackRequest');

    cy.intercept(
      'PUT',
      '/api/insights-results-aggregator/v1/clusters/**/rules/**/error_key/**/enable',
      {
        statusCode: 200,
      },
    ).as('enableRequest');
  });

  it('header shows description', () => {
    // See https://github.com/RedHatInsights/frontend-components/blob/master/packages/advisor-components/src/RuleDetails/RuleDetails.spec.ct.js
    // for further test on the header
    cy.get(TITLE)
      .get('h1')
      .should(($el) => expect($el.text().trim()).to.equal(ruleDescription))
      .and('have.length', 1);
  });

  it('shows info about some disabled clusters', () => {
    cy.ouiaId('hosts-acked').within(() => {
      cy.get(TITLE).should(
        'include.text',
        'Recommendation is disabled for some clusters',
      );
      cy.get('.pf-v6-c-card__body').should(
        'include.text',
        `${clusterDetails.data.disabled.length} cluster`,
      );
      cy.ouiaId('enable').should(
        'have.text',
        'Enable this recommendation for all clusters',
      );
    });
  });

  it('table is displayed', () => {
    cy.get('#affected-list-table')
      .within(() => {
        cy.ouiaId('clusters').should('have.length', 1);
      })
      .parent()
      .get(TITLE)
      .get('h3')
      .should('have.text', 'Affected clusters');
  });

  it('category labels are displayed', () => {
    cy.get('.categoryLabels').should('have.length', 1);
  });

  it('actions can ack recommendation', () => {
    cy.ouiaId('actions-toggle').click();
    cy.ouiaId('actions').within(() => {
      cy.get('button').should('have.text', 'Disable recommendation').click();
    });
    cy.ouiaId('recommendation-disable').should('exist');
  });

  it('all clusters can be enabled at once', () => {
    cy.ouiaId('hosts-acked')
      .ouiaId('enable')
      .click()
      .then(() => {
        // wait for the expected number of network calls
        for (const cluster of clusterDetails.data.disabled) {
          cy.wait('@enableRequest').then((xhr) => {
            expect(xhr.request.url).to.contain(cluster.cluster_id);
          });
        }
      });
  });

  describe('disabled clusters modal', () => {
    it('can be displayed', () => {
      cy.ouiaId('hosts-acked').ouiaId('view-clusters').click();
      cy.ouiaId('hosts-disabled').should('exist');
    });
    it('has expected clusters', () => {
      cy.ouiaId('hosts-acked').ouiaId('view-clusters').click();
      cy.ouiaId('hosts-disabled')
        .find(TBODY)
        .find(ROW)
        .should('have.length', clusterDetails.data.disabled.length);
      const clusters = _.map(
        clusterDetails.data.disabled,
        (it) => it.cluster_name || it.cluster_id,
      );
      cy.get(`td[data-label="Cluster name"]`)
        .then(($els) => {
          return _.map(Cypress.$.makeArray($els), 'innerText');
        })
        .should('deep.equal', clusters);
    });
  });

  describe('risk sections', () => {
    it('total risk section is displayed', () => {
      cy.get('.ins-c-rule-details__stack').within(() => {
        cy.get('.ins-c-rule-details__total-risk').contains('Moderate');
        cy.get('.ins-c-rule-details__total-risk')
          .find('.pf-v6-c-label__icon')
          .should('have.length', 1); // contains an icon
      });
    });

    it('contains 2 severity lines', () => {
      cy.get('.ins-c-rule-details__stack').within(() => {
        cy.get('.ins-c-severity-line').should('have.length', 2);
        cy.get('.ins-c-severity-line')
          .eq(0)
          .find('.ins-l-title')
          .contains('High likelihood');
        cy.get('.ins-c-severity-line')
          .eq(1)
          .find('.ins-l-title')
          .contains('Medium impact');
      });
    });

    it('contains risk of change', () => {
      cy.get('.ins-c-rule-details__stack').within(() => {
        cy.get('.ins-c-rule-details__risk-of-ch-label')
          .should('have.length', 1)
          .contains('Low');
        cy.get('.ins-c-rule-details__risk-of-ch-desc')
          .should('have.length', 1)
          .and(
            'have.text',
            'The change poses no risk to workloads on the cluster.',
          );
      });
    });
  });
});

describe('recommendation page for enabled recommedation with nulled resolution risk', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Recommendation
              rule={{ ...defaultPropsRule, data: nulledResolutionRisk }}
              ack={{ ...defaultPropsAck, data: undefined }}
              clusters={{ ...defaultPropsClusterDetails }}
              recId="X"
            />
          </Provider>
        </Intl>
      </MemoryRouter>,
    );
  });

  it('risk of change section is hidden', () => {
    cy.get('.ins-c-rule-details__stack').within(() => {
      cy.get('.ins-c-rule-details__risk-of-ch-label').should('have.length', 0);
    });
  });
});

describe('recommendation page for enabled recommendation without disabled clusters', () => {
  let data = _.cloneDeep(clusterDetails.data);
  data.disabled = [];
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Recommendation
              rule={{ ...defaultPropsRule }}
              ack={{ ...defaultPropsAck, data: undefined }}
              clusters={{ ...defaultPropsClusterDetails, data: data }}
              recId="X"
            />
          </Provider>
        </Intl>
      </MemoryRouter>,
    );

    cy.intercept('POST', '/api/insights-results-aggregator/v2/ack', {
      statusCode: 201,
    }).as('ackRequest');
  });

  it('header shows description', () => {
    cy.get(TITLE)
      .get('h1')
      .should(($el) => expect($el.text().trim()).to.equal(ruleDescription))
      .and('have.length', 1);
  });

  it('does not show info about disabled clusters', () => {
    cy.ouiaId('hosts-acked').should('not.exist');
  });

  it('table is displayed', () => {
    cy.get('#affected-list-table')
      .within(() => {
        cy.ouiaId('clusters').should('have.length', 1);
      })
      .parent()
      .get(TITLE)
      .get('h3')
      .should('have.text', 'Affected clusters');
  });

  it('category labels are displayed', () => {
    cy.get('.categoryLabels').should('have.length', 1);
  });

  it('actions can ack recommendation', () => {
    cy.ouiaId('actions-toggle').click();
    cy.ouiaId('actions').within(() => {
      cy.get('button').should('have.text', 'Disable recommendation').click();
    });
    cy.ouiaId('recommendation-disable').should('exist');
  });
});

describe('recommendation page for disabled recommendation', () => {
  beforeEach(() => {
    cy.mount(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <Recommendation
              rule={{ ...defaultPropsRule, data: disabledRule }}
              ack={{ ...defaultPropsAck }}
              clusters={{ ...defaultPropsClusterDetails }}
              recId="X"
            />
          </Provider>
        </Intl>
      </MemoryRouter>,
    );

    cy.intercept('DELETE', '/api/insights-results-aggregator/v2/ack/*', {
      statusCode: 204,
    }).as('deackRequest');
  });

  it('header shows disabled label', () => {
    cy.get(TITLE)
      .get('h1')
      .should(($el) =>
        expect($el.text().trim()).to.equal(ruleDescription + ' Disabled'),
      );
  });

  it('shows info about the recommendation being acked', () => {
    cy.ouiaId('hosts-acked').within(() => {
      cy.get(TITLE).should('include.text', 'Recommendation is disabled');
      cy.get('.pf-v6-c-card__body').should(
        'include.text',
        `and has no results`,
      );
      cy.ouiaId('enable').should('have.text', 'Enable recommendation');
    });
  });

  it('table is not displayed', () => {
    cy.get('#affected-list-table').should('not.exist');
    cy.ouiaId('empty-state').within(() => {
      cy.get('.pf-v6-c-empty-state__title-text').should(
        'include.text',
        'Recommendation is disabled',
      );
    });
  });

  it('actions button allow for enabling', () => {
    cy.ouiaId('actions-toggle').click();
    cy.ouiaId('actions')
      .click()
      .within(() => {
        cy.get('button')
          .should('have.text', 'Enable recommendation')
          .click()
          .then(() => {
            cy.wait('@deackRequest').then((xhr) =>
              assert.isOk(
                xhr.request.url.includes(
                  encodeURIComponent(rule.content.rule_id),
                ),
              ),
            );
          });
      });
  });
});

describe('justification message', () => {
  describe('when not provided', () => {
    before(() => {
      cy.mount(
        <MemoryRouter>
          <Intl>
            <Provider store={getStore()}>
              <Recommendation
                rule={{
                  ...defaultPropsRule,
                  data: disabledRule,
                }}
                ack={{
                  ...defaultPropsAck,
                  data: { ...ack, ...{ justification: '' } },
                }}
                clusters={{ ...defaultPropsClusterDetails }}
                recId="X"
              />
            </Provider>
          </Intl>
        </MemoryRouter>,
      );
    });
    it('should not display reason', () => {
      cy.ouiaId('hosts-acked').within(() => {
        cy.get('.pf-v6-c-card__body')
          .should('not.include.text', 'because')
          .and('not.include.text', 'None');
      });
    });
  });

  describe('when provided', () => {
    const justification = 'I would like to see it';
    before(() => {
      cy.mount(
        <MemoryRouter>
          <Intl>
            <Provider store={getStore()}>
              <Recommendation
                rule={{
                  ...defaultPropsRule,
                  data: disabledRule,
                }}
                ack={{
                  ...defaultPropsAck,
                  data: { ...ack, ...{ justification: justification } },
                }}
                clusters={{ ...defaultPropsClusterDetails }}
                recId="X"
              />
            </Provider>
          </Intl>
        </MemoryRouter>,
      );
    });
    it('should display reason', () => {
      cy.ouiaId('hosts-acked').within(() => {
        cy.get('.pf-v6-c-card__body').should(
          'include.text',
          `because ${justification}`,
        );
      });
    });
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
    {},
  );

  function tags2categories(tags) {
    return _.filter(_.map(tags, (x) => CATEGORIES_MAP[x]));
  }
  it('at least one tag combination is empty', () => {
    expect(_.map(tagsCombinations, (it) => it.length)).to.include(0);
  });
  it('at least one tag combination is only 1 valid category', () => {
    expect(
      _.map(_.map(tagsCombinations, tags2categories), (it) => it.length),
    ).to.include(1);
  });
  it('at least one tag combination has 0 valid categories', () => {
    expect(
      _.map(_.map(tagsCombinations, tags2categories), (it) => it.length),
    ).to.include(0);
  });
  it('at least one tag combination is >1 valid categories', () => {
    expect(
      _.filter(
        _.map(_.map(tagsCombinations, tags2categories), (it) => it.length),
        (it) => it >= 2,
      ),
    ).to.have.length.gte(1);
  });

  tagsCombinations.forEach((tags) => {
    describe(`${tags}`, () => {
      const categories = tags2categories(tags);
      const taggedRule = _.cloneDeep(rule);
      taggedRule.content.tags = tags;
      beforeEach(() => {
        cy.mount(
          <MemoryRouter>
            <Intl>
              <Provider store={getStore()}>
                <Recommendation
                  rule={{ ...defaultPropsRule, data: taggedRule }}
                  ack={{ ...defaultPropsAck, data: undefined }}
                  clusters={{ ...defaultPropsClusterDetails }}
                  recId="X"
                />
              </Provider>
            </Intl>
          </MemoryRouter>,
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

          // TODO we are not implementing this logic, so this might be already tested somewhere else
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
