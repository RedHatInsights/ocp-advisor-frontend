import './Recommendation.scss';

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import { LabelGroup, Title } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { global_danger_color_100 as globalDangerColor100 } from '@patternfly/react-tokens';

import Breadcrumbs from '../Breadcrumbs';
import RuleLabels from '../RuleLabels/RuleLabels';
import {
  FILTER_CATEGORIES,
  IMPACT_VALUES,
  RULE_CATEGORIES,
} from '../../AppConstants';
import messages from '../../Messages';
import RuleDetails from './RuleDetails';
import Loading from '../Loading/Loading';
import { getErrorKey } from '../../Utilities/RuleName';
import MessageState from '../MessageState/MessageState';
import AffectedClustersTable from './AffectedClustersTable';

const Recommendation = ({ rule, intl, match }) => {
  const { isError, isUninitialized, isLoading, isFetching, isSuccess, data } =
    rule;
  // workaround. Should be removed when https://issues.redhat.com/browse/CCXDEV-5534 is done.
  const adjustOCPRule = useCallback((rule) => {
    const errorKeyContent =
      rule.error_keys[getErrorKey(match.params.recommendationId)];
    const adjusted = {
      ...rule,
      ...errorKeyContent,
      ...errorKeyContent.metadata,
    };
    adjusted.impact = {
      name: adjusted.impact,
      impact: IMPACT_VALUES[adjusted.impact],
    };
    delete adjusted.metadata;
    delete adjusted.error_keys;
    console.log(adjusted);
    adjusted.tags = [...adjusted.tags, 'fault_tolerance', 'security'];
    return adjusted;
  }, []);
  const content = isSuccess ? adjustOCPRule(data.content) : undefined;

  return (
    <React.Fragment>
      {(isUninitialized || isLoading || isFetching) && (
        <Main>
          <Loading />
        </Main>
      )}
      {isError && (
        <Main>
          <MessageState
            title={intl.formatMessage(messages.unableToConnect)}
            text={intl.formatMessage(messages.unableToConnectDesc)}
            icon={ExclamationCircleIcon}
            iconStyle={{ color: globalDangerColor100.value }}
          />
        </Main>
      )}
      {isSuccess && (
        <React.Fragment>
          <PageHeader className="pageHeaderOverride">
            <Breadcrumbs
              current={content?.description || match.params.recommendationId}
            />
          </PageHeader>
          <Main className="pf-m-light pf-u-pt-sm">
            <RuleDetails
              isOpenShift
              isDetailsPage
              rule={content}
              header={
                <React.Fragment>
                  <PageHeaderTitle
                    title={
                      <React.Fragment>
                        {content.description} <RuleLabels rule={content} />
                      </React.Fragment>
                    }
                  />
                  <p>
                    {intl.formatMessage(messages.rulesDetailsPubishdate, {
                      date: (
                        <DateFormat
                          date={new Date(content.publish_date)}
                          type="onlyDate"
                        />
                      ),
                    })}
                    <LabelGroup className="categoryLabels" numLabels={1}>
                      {Array.isArray(content.tags) ? (
                        content.tags.reduce((labels, tag) => {
                          if (RULE_CATEGORIES[tag]) {
                            console.log(tag);
                            labels.push(
                              <Label key={`label-${tag}`} color="blue">
                                {
                                  FILTER_CATEGORIES.category.values[
                                    RULE_CATEGORIES[tag] - 1
                                  ].label
                                }
                              </Label>
                            );
                          }
                          return labels;
                        }, [])
                      ) : (
                        <Label>{content.tags}</Label>
                      )}
                    </LabelGroup>
                  </p>
                </React.Fragment>
              }
              intl={intl}
            />
          </Main>
          <Main>
            <React.Fragment>
              <React.Fragment>
                <Title className="titleOverride" headingLevel="h3" size="2xl">
                  {intl.formatMessage(messages.affectedClusters)}
                </Title>
                <AffectedClustersTable />
              </React.Fragment>
            </React.Fragment>
          </Main>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

Recommendation.propTypes = {
  rule: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export { Recommendation };
