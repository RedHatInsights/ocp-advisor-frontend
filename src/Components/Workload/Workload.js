import React from 'react';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import { Flex, FlexItem, PageSection } from '@patternfly/react-core';
import Breadcrumbs from '../Breadcrumbs';
import WorkloadsHeader from '../WorkloadHeader';
import PropTypes from 'prop-types';

export const Workload = ({ workload, namespaceId, clusterId }) => {
  return (
    <React.Fragment>
      <PageHeader className="pf-m-light ins-inventory-detail">
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <Breadcrumbs
              current={
                workload?.data?.status === 'ok'
                  ? `${workload.data.cluster.display_name} | ${workload.data.namespace.name}`
                  : `${clusterId} | ${namespaceId}`
              }
            />
            <WorkloadsHeader />
          </FlexItem>
        </Flex>
      </PageHeader>
      <PageSection>{/* <WorkloadRules workload={workload} /> */}</PageSection>
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
