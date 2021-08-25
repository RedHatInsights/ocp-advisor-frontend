import './_Cluster.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem } from '@patternfly/react-core';

import { SearchIcon } from '@patternfly/react-icons';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';

import ClusterHeader from '../ClusterHeader';
import ClusterRules from '../ClusterRules/ClusterRules';
import Breadcrumbs from '../Breadcrumbs';
import MessageState from '../MessageState/MessageState';
import Loading from '../Loading/Loading';

export const Cluster = ({ cluster, match }) => {
  const { isError, isUninitialized, isLoading, isFetching, isSuccess, data } =
    cluster;

  return (
    <React.Fragment>
      <PageHeader className="pf-m-light ins-inventory-detail">
        <Breadcrumbs current={match.params.clusterId} match={match} />
        <ClusterHeader />
      </PageHeader>
      <Main>
        <React.Fragment>
          {isError && (
            <MessageState
              title="No recommendations available"
              text="There was an error fetching recommendations for this cluster. Refresh your page to try again."
              icon={SearchIcon}
            />
          )}
          {(isUninitialized || isLoading || isFetching) && <Loading />}
          {isSuccess && (
            <Grid hasGutter>
              <GridItem span={12}>
                <ClusterRules reports={data?.report?.data || []} />
              </GridItem>
            </Grid>
          )}
        </React.Fragment>
      </Main>
    </React.Fragment>
  );
};

Cluster.propTypes = {
  cluster: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};
