import './Recommendation.scss';

import React from 'react';
import PropTypes from 'prop-types';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import { LabelGroup } from '@patternfly/react-core';

import Breadcrumbs from '../Breadcrumbs';
import RuleLabels from '../RuleLabels/RuleLabels';
import { FILTER_CATEGORIES, RULE_CATEGORIES } from '../../AppConstants';
import messages from '../../Messages';
import RuleDetails from './RuleDetails';

const Recommendation = ({ rule, intl }) => {
  return (
    <React.Fragment>
      <PageHeader>
        <Breadcrumbs current={rule.description || ''} />
      </PageHeader>
      <Main className="pf-m-light pf-u-pt-sm">
        <RuleDetails
          isDetailsPage
          rule={rule}
          header={
            <React.Fragment>
              <PageHeaderTitle
                title={
                  <React.Fragment>
                    {rule.description} <RuleLabels rule={rule} />
                  </React.Fragment>
                }
              />
              <p>
                {intl.formatMessage(messages.rulesDetailsPubishdate, {
                  date: (
                    <DateFormat
                      date={new Date(rule.created_at)}
                      type="onlyDate"
                    />
                  ),
                })}
                <LabelGroup className="categoryLabels" numLabels={1}>
                  {Array.isArray(rule.tags) ? (
                    rule.tags.reduce((labels, tag) => {
                      if (RULE_CATEGORIES[tag]) {
                        labels.push(
                          <Label key={`label-${tag}`} color="blue">
                            {
                              FILTER_CATEGORIES.category.values[
                                RULE_CATEGORIES[tag]
                              ].label
                            }
                          </Label>
                        );
                      }
                      return labels;
                    }, [])
                  ) : (
                    <Label>{rule.tags}</Label>
                  )}
                </LabelGroup>
              </p>
            </React.Fragment>
          }
          intl={intl}
        />
      </Main>
    </React.Fragment>
  );
};

Recommendation.propTypes = {
  rule: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

export { Recommendation };
