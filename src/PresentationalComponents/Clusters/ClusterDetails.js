import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import Breadcrumbs from '../../PresentationalComponents/Breadcrumbs/Breadcrumbs';

import { PageHeader } from '@redhat-cloud-services/frontend-components/PageHeader';

import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

import * as AppActions from '../../AppActions';
import messages from '../../Messages';
import { Main } from '@redhat-cloud-services/frontend-components/Main';

const ClusterDetails = ({ cluster, match }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    if (match.params.clusterId) {
      const subnav = `${match.params.clusterId} - ${messages.clusters.defaultMessage}`;
      document.title = intl.formatMessage(messages.documentTitle, { subnav });
    }

    dispatch(AppActions.fetchCluster(match.params.clusterId));
  }, [match.params.clusterId]);

  return (
    <PageHeader className="pf-m-light ins-inventory-detail">
      {cluster && (
        <Breadcrumbs current={match.params.clusterId} match={match} />
      )}
    </PageHeader>
  );
};

ClusterDetails.propTypes = {
  history: PropTypes.object,
  cluster: PropTypes.object,
  clusterFetchStatus: PropTypes.string,
  match: PropTypes.any,
};

const mapStateToProps = ({ cluster, clusterFetchStatus, props }) => ({
  cluster,
  clusterFetchStatus,
  ...props,
});

export default routerParams(connect(mapStateToProps, null)(ClusterDetails));
