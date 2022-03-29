import './_Cluster.scss';

import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import ClusterHeader from '../ClusterHeader';
import ClusterRules from '../ClusterRules/ClusterRules';
import Breadcrumbs from '../Breadcrumbs';
import Main from '@redhat-cloud-services/frontend-components/Main';

export const Cluster = ({ cluster, match }) => {
  return (
    <React.Fragment>
      <PageHeader className="pf-m-light ins-inventory-detail">
        <Breadcrumbs
          current={
            cluster?.data?.report.meta.cluster_name || match.params.clusterId
          }
          match={match}
        />
        <ClusterHeader />
      </PageHeader>
      <Main>
        <ClusterRules cluster={cluster} />
      </Main>
    </React.Fragment>
  );
};

Cluster.propTypes = {
  cluster: PropTypes.object.isRequired,
  displayName: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};
