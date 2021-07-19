import './_Cluster.scss';

import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, GridItem } from '@patternfly/react-core';

import { SearchIcon } from '@patternfly/react-icons';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

import messages from '../../Messages';
import ClusterHeader from '../ClusterHeader/ClusterHeader';
import ClusterRules from '../ClusterRules/ClusterRules';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import { fetchClusterById } from '../../AppActions';
import MessageState from '../MessageState/MessageState';
import Loading from '../Loading/Loading';

const Cluster = ({ match }) => {
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
      <PageHeader className="pf-m-light ins-inventory-detail">
        {cluster && (
          <Breadcrumbs current={match.params.clusterId} match={match} />
        )}
        <ClusterHeader uuid={match.params.clusterId} />
      </PageHeader>
      <Main>
        <React.Fragment>
          {cluster && cluster.fetchStatus === 'rejected' && (
            <MessageState
              title="No recommendations available"
              text="There was an error fetching recommendations for this cluster. Refresh your page to try again."
              icon={SearchIcon}
            />
          )}
          {cluster && cluster.fetchStatus === 'pending' && <Loading />}
          {cluster && cluster.fetchStatus === 'fulfilled' && (
            <Grid hasGutter>
              <GridItem span={12}>
                <ClusterRules cluster={cluster} />
              </GridItem>
            </Grid>
          )}
        </React.Fragment>
      </Main>
    </React.Fragment>
  );
};

Cluster.propTypes = {
  history: PropTypes.object,
  match: PropTypes.any,
};

export default routerParams(Cluster);
