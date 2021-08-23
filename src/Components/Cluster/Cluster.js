import './_Cluster.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Grid, GridItem } from '@patternfly/react-core';

import { SearchIcon } from '@patternfly/react-icons';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';

import ClusterHeader from '../ClusterHeader';
import ClusterRules from '../ClusterRules/ClusterRules';
import Breadcrumbs from '../Breadcrumbs';
import MessageState from '../MessageState/MessageState';
import Loading from '../Loading/Loading';
import messages from '../../Messages';

export const Cluster = ({ cluster, match }) => {
  const intl = useIntl();
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
              title={intl.formatMessage(messages.noRecsError)}
              text={intl.formatMessage(messages.noRecsErrorDesc)}
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
  intl: PropTypes.object.isRequired,
};
