import './Recommendation.scss';

import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@patternfly/react-core/dist/js/components/Card';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import {
  Label,
  Title,
  LabelGroup,
  Button,
  Flex,
  FlexItem,
  Icon,
  Dropdown,
  MenuToggle,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { ErrorState } from '@redhat-cloud-services/frontend-components/ErrorState';
import {
  AdvisorProduct,
  RuleDetails,
  RuleDetailsMessagesKeys,
} from '@redhat-cloud-services/frontend-components-advisor-components';

import Breadcrumbs from '../Breadcrumbs';
import RuleLabels from '../Labels/RuleLabels';
import {
  FILTER_CATEGORIES,
  RISK_OF_CHANGE_DESC,
  RULE_CATEGORIES,
} from '../../AppConstants';
import messages from '../../Messages';
import Loading from '../Loading/Loading';
import { adjustOCPRule } from '../../Utilities/Rule';
import MessageState from '../MessageState/MessageState';
import { AffectedClustersTable } from '../AffectedClustersTable/AffectedClustersTable';
import { Delete, Post } from '../../Utilities/Api';
import { BASE_URL } from '../../Services/SmartProxy';
import DisableRule from '../Modals/DisableRule';
import ViewHostAcks from '../Modals/ViewHostAcks';
import { OneLineLoader } from '../../Utilities/Loaders';
import { enableRuleForCluster } from '../../Services/Acks';
import { formatMessages, mapContentToValues } from '../../Utilities/intlHelper';
import inRange from 'lodash/inRange';

const Recommendation = ({ rule, ack, clusters, recId }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const notify = (data) => dispatch(addNotification(data));
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [viewSystemsModalOpen, setViewSystemsModalOpen] = useState(false);

  // rule's info
  const {
    isError,
    isUninitialized,
    isLoading,
    isFetching,
    isSuccess,
    data,
    refetch,
  } = rule;
  // justification note, last time acknowledged, etc.
  const { data: ackData, isFetching: ackIsFetching, refetch: refetchAck } = ack;
  const ruleDate = new Date(ackData?.updated_at || ackData?.created_at);
  // affected and acked clusters lists
  const {
    data: clustersData,
    isFetching: clustersIsFetching,
    refetch: refetchClusters,
  } = clusters;

  const content =
    isSuccess && data ? adjustOCPRule(data.content, recId) : undefined;
  const ackedClusters =
    !clustersIsFetching && clustersData ? clustersData.disabled : undefined;

  const afterDisableFn = async () => {
    refetch();
    refetchAck();
    refetchClusters();
  };

  const handleModalToggle = (disableRuleModalOpen) => {
    setDisableRuleModalOpen(disableRuleModalOpen);
  };

  const enableRecForHosts = async ({ uuids }) => {
    try {
      const requests = uuids.map((uuid) =>
        enableRuleForCluster({ uuid, recId })
      );
      await Promise.all(requests);
      refetch();
      refetchAck();
      refetchClusters();
      notify({
        variant: 'success',
        timeout: true,
        dismissable: true,
        title: intl.formatMessage(messages.recSuccessfullyEnabledForCluster),
      });
    } catch (error) {
      notify({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  const enableRule = async (rule) => {
    try {
      await Delete(`${BASE_URL}/v2/ack/${rule.data.content.rule_id}`);
      notify({
        variant: 'success',
        timeout: true,
        dismissable: true,
        title: intl.formatMessage(messages.recSuccessfullyEnabled),
      });
      refetch();
    } catch (error) {
      handleModalToggle(false);
      notify({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  const messagesValues = useMemo(
    () => (content ? mapContentToValues(intl, content) : {}),
    [intl, content]
  );

  return (
    <React.Fragment>
      {viewSystemsModalOpen && (
        <ViewHostAcks
          handleModalToggle={(toggleModal) =>
            setViewSystemsModalOpen(toggleModal)
          }
          isModalOpen={viewSystemsModalOpen}
          clusters={clusters}
          afterFn={() => refetchClusters()}
          recId={recId}
        />
      )}
      {disableRuleModalOpen && (
        <DisableRule
          handleModalToggle={handleModalToggle}
          isModalOpen={disableRuleModalOpen}
          rule={content}
          afterFn={afterDisableFn}
        />
      )}
      <PageHeader className="pageHeaderOverride">
        <Breadcrumbs current={content?.description || recId} />
      </PageHeader>
      {(isUninitialized || isLoading || isFetching) && (
        <section className="pf-l-page__main-section pf-c-page__main-section pf-m-light pf-u-pt-sm">
          <Loading />
        </section>
      )}
      {isError && (
        <section className="pf-l-page__main-section pf-c-page__main-section pf-m-light pf-u-pt-sm">
          <ErrorState />
        </section>
      )}
      {!(isUninitialized || isLoading || isFetching) && isSuccess && (
        <React.Fragment>
          <section className="pf-l-page__main-section pf-c-page__main-section pf-m-light pf-u-pt-sm">
            <RuleDetails
              messages={formatMessages(
                intl,
                RuleDetailsMessagesKeys,
                messagesValues
              )}
              product={AdvisorProduct.ocp}
              rule={content}
              isDetailsPage
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
                    {intl.formatMessage(messages.rulesDetailsModifiedDate, {
                      date: (
                        <DateFormat
                          date={new Date(content.publish_date)}
                          type="onlyDate"
                        />
                      ),
                    })}
                    {content.tags &&
                      (Array.isArray(content.tags) ? (
                        <LabelGroup
                          className="categoryLabels"
                          numLabels={1}
                          isCompact
                        >
                          {content.tags.reduce((labels, tag) => {
                            if (RULE_CATEGORIES[tag]) {
                              labels.push(
                                <Label
                                  key={`label-${tag}`}
                                  color="blue"
                                  isCompact
                                >
                                  {
                                    FILTER_CATEGORIES.category.values[
                                      RULE_CATEGORIES[tag] - 1
                                    ].label
                                  }
                                </Label>
                              );
                            }
                            return labels;
                          }, [])}
                        </LabelGroup>
                      ) : (
                        <Label isCompact>{content.tags}</Label>
                      ))}
                  </p>
                </React.Fragment>
              }
              onVoteClick={async (rule, rating) =>
                await Post(`${BASE_URL}/v2/rating`, {}, { rule, rating })
              }
              {...(inRange(content?.resolution_risk, 1, 5) // resolution risk can be 0 (not defined for particular rule)
                ? {
                    resolutionRisk: content?.resolution_risk,
                    resolutionRiskDesc:
                      RISK_OF_CHANGE_DESC[content?.resolution_risk],
                  }
                : {})}
            >
              <Flex>
                <FlexItem align={{ default: 'alignRight' }}>
                  <Dropdown
                    className="ins-c-rec-details__actions_dropdown"
                    onOpenChange={(isOpen) => setActionsDropdownOpen(isOpen)}
                    popperProps={{
                      position: 'right',
                    }}
                    ouiaId="actions"
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ouiaId="actions-toggle"
                        // ouiaId="actions-toggle"
                        ref={toggleRef}
                        onClick={() =>
                          setActionsDropdownOpen(!actionsDropdownOpen)
                        }
                      >
                        {intl.formatMessage(messages.actions)}
                      </MenuToggle>
                    )}
                    isOpen={actionsDropdownOpen}
                  >
                    <DropdownList>
                      {content?.disabled ? (
                        <DropdownItem
                          key="link"
                          ouiaId="enable"
                          onClick={() => {
                            enableRule(rule);
                          }}
                        >
                          {intl.formatMessage(messages.enableRule)}
                        </DropdownItem>
                      ) : (
                        <DropdownItem
                          key="link"
                          ouiaId="disable"
                          onClick={() => {
                            handleModalToggle(true);
                          }}
                        >
                          {intl.formatMessage(messages.disableRule)}
                        </DropdownItem>
                      )}
                    </DropdownList>
                  </Dropdown>
                </FlexItem>
              </Flex>
            </RuleDetails>
          </section>
          <section className="pf-l-page__main-section pf-c-page__main-section">
            <React.Fragment>
              {(content?.hosts_acked_count ||
                ackedClusters?.length > 0 ||
                content?.disabled) && (
                <Card className="cardOverride" ouiaId="hosts-acked">
                  <CardHeader>
                    <Title headingLevel="h4" size="xl">
                      <Icon size="md">
                        <BellSlashIcon />
                      </Icon>
                      &nbsp;
                      {intl.formatMessage(
                        (content?.hosts_acked_count ||
                          ackedClusters?.length > 0) &&
                          !content?.disabled
                          ? messages.ruleIsDisabledForClusters
                          : messages.ruleIsDisabled
                      )}
                    </Title>
                  </CardHeader>
                  <CardBody>
                    {(content?.hosts_acked_count ||
                      ackedClusters?.length > 0) &&
                    !content?.disabled ? (
                      <React.Fragment>
                        {intl.formatMessage(
                          messages.ruleIsDisabledForClustersBody,
                          {
                            clusters: ackedClusters?.length,
                          }
                        )}
                        {!clustersIsFetching && ackedClusters?.length > 0 ? (
                          <React.Fragment>
                            &nbsp;
                            <Button
                              isInline
                              variant="link"
                              onClick={() => setViewSystemsModalOpen(true)}
                              ouiaId="view-clusters"
                            >
                              {intl.formatMessage(messages.viewClusters)}
                            </Button>
                          </React.Fragment>
                        ) : (
                          <OneLineLoader />
                        )}
                      </React.Fragment>
                    ) : (
                      !ackIsFetching &&
                      ackData && (
                        <React.Fragment>
                          {ackData?.justification
                            ? intl.formatMessage(
                                messages.ruleIsDisabledWithJustificaiton,
                                {
                                  date: (
                                    <span>
                                      <DateFormat
                                        date={ruleDate}
                                        type="onlyDate"
                                      />
                                    </span>
                                  ),
                                  reason: ackData.justification,
                                }
                              )
                            : intl.formatMessage(
                                messages.ruleIsDisabledWithoutJustificaiton,
                                {
                                  date: (
                                    <span>
                                      <DateFormat
                                        date={ruleDate}
                                        type="onlyDate"
                                      />
                                    </span>
                                  ),
                                }
                              )}
                        </React.Fragment>
                      )
                    )}
                  </CardBody>
                  <CardFooter>
                    {(content?.hosts_acked_count ||
                      ackedClusters?.length > 0) &&
                    !content?.disabled ? (
                      !clustersIsFetching && ackedClusters ? (
                        <Button
                          isInline
                          variant="link"
                          onClick={() =>
                            enableRecForHosts({
                              uuids: ackedClusters.map((c) => c.cluster_id),
                            })
                          }
                          ouiaId="enable"
                        >
                          {intl.formatMessage(messages.enableRuleForClusters)}
                        </Button>
                      ) : (
                        <OneLineLoader />
                      )
                    ) : (
                      <Button
                        isInline
                        variant="link"
                        onClick={() => enableRule(rule)}
                        ouiaId="enable"
                      >
                        {intl.formatMessage(messages.enableRule)}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}
              {!content?.disabled && (
                <React.Fragment>
                  <Title className="titleOverride" headingLevel="h3" size="2xl">
                    {intl.formatMessage(messages.affectedClusters)}
                  </Title>
                  <AffectedClustersTable
                    query={clusters}
                    rule={content}
                    afterDisableFn={afterDisableFn}
                  />
                </React.Fragment>
              )}
              {content?.disabled && (
                <MessageState
                  icon={BellSlashIcon}
                  title={intl.formatMessage(messages.ruleIsDisabled)}
                  text={intl.formatMessage(messages.ruleIsDisabledBody)}
                />
              )}
            </React.Fragment>
          </section>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

Recommendation.propTypes = {
  rule: PropTypes.object.isRequired,
  ack: PropTypes.object.isRequired,
  clusters: PropTypes.object.isRequired,
  recId: PropTypes.string.isRequired,
};

export { Recommendation };
