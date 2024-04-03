import React from 'react';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import { Flex, FlexItem, PageSection, Title } from '@patternfly/react-core';
import Breadcrumbs from '../Breadcrumbs';
import WorkloadsHeader from '../WorkloadHeader';
import PropTypes from 'prop-types';
import WorkloadRules from '../WorkloadRules/WorkloadRules';

export const Workload = ({ workload, namespaceId, clusterId }) => {
  const namespaceName = workload.data?.namespace?.name;
  const clusterName = workload.data?.cluster?.display_name;
  let constructBreadcrumbs;

  switch (true) {
    case clusterName?.length > 0 && namespaceName?.length > 0:
      constructBreadcrumbs = `${workload.data?.cluster?.display_name} | ${workload.data?.namespace?.name}`;
      break;
    case clusterName?.length > 0 && namespaceName?.length === 0:
      constructBreadcrumbs = `${workload.data?.cluster?.display_name} | ${namespaceId}`;
      break;
    case clusterName?.length === 0 && namespaceName?.length > 0:
      constructBreadcrumbs = `${clusterId} | ${workload.data?.namespace?.name}`;
      break;
    case clusterName?.length === 0 && namespaceName?.length === 0:
      constructBreadcrumbs = `${clusterId} | ${namespaceId}`;
  }
  return (
    <React.Fragment>
      <PageHeader className="pf-m-light ins-inventory-detail">
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <Breadcrumbs current={constructBreadcrumbs} workloads="true" />
            <WorkloadsHeader
              workload={workload}
              namespaceId={namespaceId}
              clusterId={clusterId}
            />
          </FlexItem>
        </Flex>
      </PageHeader>
      <PageSection>
        <Title className="pf-u-mb-lg" headingLevel="h3" size="2xl">
          Recommendations
        </Title>
        <WorkloadRules
          workload={workload}
          namespaceName={workload?.data?.namespace?.name}
        />
      </PageSection>
    </React.Fragment>
  );
};

Workload.propTypes = {
  clusterId: PropTypes.string.isRequired,
  namespaceId: PropTypes.string.isRequired,
  workload: PropTypes.shape({
    isUninitialized: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      namespace: PropTypes.shape({
        uuid: PropTypes.string,
        name: PropTypes.string,
      }),
      cluster: PropTypes.shape({
        uuid: PropTypes.string,
        display_name: PropTypes.string,
      }),
      status: PropTypes.string,
    }),
  }),
};
