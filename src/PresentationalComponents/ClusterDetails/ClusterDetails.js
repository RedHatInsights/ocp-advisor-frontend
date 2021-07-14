import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Grid, GridItem } from '@patternfly/react-core';
import { List } from 'react-content-loader';

import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

import messages from '../../Messages';
import ClusterDetailHead from '../ClusterDetailHead/ClusterDetailHead';
import ClusterRecommendations from '../ClusterRecommendations/ClusterRecommendations';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { fetchClusterById } from '../../AppActions';

const ClusterDetails = ({ match }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const cluster = useSelector(
    (AdvisorStore) => AdvisorStore.clusters[match.params.clusterId]
  );

  useEffect(() => {
    if (match.params.clusterId) {
      const subnav = `${match.params.clusterId} - ${intl.formatMessage(
        messages.clusters
      )}`;
      document.title = intl.formatMessage(messages.documentTitle, { subnav });
    }

    dispatch(fetchClusterById(match.params.clusterId));
  }, [match.params.clusterId]);

  return (
    <React.Fragment>
      {cluster && cluster.fetchStatus === 'rejected' && (
        <Main>Cluster not found</Main> // TODO: Create empty states
      )}
      {cluster && cluster.fetchStatus === 'pending' && (
        <Card>
          <List />
        </Card>
      )}
      {cluster && cluster.fetchStatus === 'fulfilled' && (
        <React.Fragment>
          <PageHeader className="pf-m-light ins-inventory-detail">
            {cluster && (
              <Breadcrumbs current={match.params.clusterId} match={match} />
            )}
            <ClusterDetailHead uuid={match.params.clusterId} />
          </PageHeader>
          <Main>
            <Grid hasGutter>
              <GridItem span={12}>
                {/*<ClusterRecommendations cluster={cluster} />*/}
              </GridItem>
            </Grid>
          </Main>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

ClusterDetails.propTypes = {
  history: PropTypes.object,
  match: PropTypes.any,
};

export default routerParams(ClusterDetails);
