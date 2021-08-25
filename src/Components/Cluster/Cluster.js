import './_Cluster.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Grid, GridItem } from '@patternfly/react-core/dist/js/layouts/Grid';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
import { global_danger_color_100 as globalDangerColor100 } from '@patternfly/react-tokens/dist/js/global_danger_color_100';

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
      {(isUninitialized || isLoading || isFetching) && (
        <Main>
          <Loading />
        </Main>
      )}
      {isError && (
        <Main>
          <MessageState
            title={intl.formatMessage(messages.noRecsError)}
            text={intl.formatMessage(messages.noRecsErrorDesc)}
            icon={ExclamationCircleIcon}
            iconStyle={{ color: globalDangerColor100.value }}
          />
        </Main>
      )}
      {isSuccess && (
        <React.Fragment>
          <PageHeader className="pf-m-light ins-inventory-detail">
            <Breadcrumbs current={match.params.clusterId} match={match} />
            <ClusterHeader />
          </PageHeader>
          <Main>
            <React.Fragment>
              <Grid hasGutter>
                <GridItem span={12}>
                  <ClusterRules reports={data?.report?.data || []} />
                </GridItem>
              </Grid>
            </React.Fragment>
          </Main>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

Cluster.propTypes = {
  cluster: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};
