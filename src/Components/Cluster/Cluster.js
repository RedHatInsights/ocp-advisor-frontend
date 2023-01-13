import './_Cluster.scss';

import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import ClusterHeader from '../ClusterHeader';
import ClusterRules from '../ClusterRules/ClusterRules';
import Breadcrumbs from '../Breadcrumbs';

export const Cluster = ({ cluster, match }) => {
  // TODO: make breadcrumbs take display name from GET /cluster/id/info
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
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <ClusterRules cluster={cluster} />
      </section>
    </React.Fragment>
  );
};

Cluster.propTypes = {
  cluster: PropTypes.object.isRequired,
  displayName: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};
