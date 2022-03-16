import './_Cluster.scss';

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Grid, GridItem } from '@patternfly/react-core/dist/js/layouts/Grid';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import InfoCircleIcon from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';
import { global_danger_color_100 as globalDangerColor100 } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import { global_info_color_100 as globalInfoColor100 } from '@patternfly/react-tokens/dist/js/global_info_color_100.js';

import ClusterHeader from '../ClusterHeader';
import ClusterRules from '../ClusterRules/ClusterRules';
import Breadcrumbs from '../Breadcrumbs';
import MessageState from '../MessageState/MessageState';
import Loading from '../Loading/Loading';
import messages from '../../Messages';

export const Cluster = ({ cluster, match }) => {
  const intl = useIntl();
  const { isError, isUninitialized, isFetching, isSuccess, data, error } =
    cluster;

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
      {(isUninitialized || isFetching) && (
        <Main id="loading-skeleton">
          <Loading />
        </Main>
      )}
      {isError &&
        (error?.status === 404 ? (
          <Main>
            <MessageState
              title={intl.formatMessage(messages.noRecsFoundError)}
              text={
                <React.Fragment>
                  {intl.formatMessage(messages.noRecsFoundErrorDesc)}
                  <a href="https://docs.openshift.com/container-platform/latest/support/getting-support.html">
                    {' '}
                    OpenShift documentation.
                  </a>
                </React.Fragment>
              }
              icon={InfoCircleIcon}
              iconStyle={{ color: globalInfoColor100.value }}
              variant="large"
            />
          </Main>
        ) : (
          <Main>
            <MessageState
              title={intl.formatMessage(messages.noRecsError)}
              text={intl.formatMessage(messages.noRecsErrorDesc)}
              icon={ExclamationCircleIcon}
              iconStyle={{ color: globalDangerColor100.value }}
            />
          </Main>
        ))}
      {isSuccess && !isFetching && (
        <React.Fragment>
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
  displayName: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};
