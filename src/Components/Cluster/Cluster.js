import './_Cluster.scss';

import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import ClusterHeader from '../ClusterHeader';
import Breadcrumbs from '../Breadcrumbs';
import ClusterTabs from '../ClusterTabs/ClusterTabs';
import { PageSection } from '@patternfly/react-core';

export const Cluster = ({ cluster, clusterId }) => {
  // TODO: make breadcrumbs take display name from GET /cluster/id/info
  return (
    <React.Fragment>
      <PageHeader className="pf-m-light ins-inventory-detail">
        <Breadcrumbs
          current={cluster?.data?.report.meta.cluster_name || clusterId}
        />
        <ClusterHeader />
      </PageHeader>
      <PageSection>
        <ClusterTabs cluster={cluster} />
      </PageSection>
    </React.Fragment>
  );
};

Cluster.propTypes = {
  cluster: PropTypes.object.isRequired,
  displayName: PropTypes.object.isRequired,
  clusterId: PropTypes.string.isRequired,
};
