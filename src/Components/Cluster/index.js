import React, { useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useIntl } from 'react-intl';

import { useGetClusterByIdQuery } from '../../Services/SmartProxy';
import messages from '../../Messages';
import { Cluster } from './Cluster';

const ClusterWrapper = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  const cluster = useGetClusterByIdQuery({
    id: match.params.clusterId,
    includeDisabled: false,
  });

  useEffect(() => {
    cluster.refetch();
  }, [match.params.clusterId]);

  useEffect(() => {
    const subnav = `${
      cluster?.data?.report?.meta?.cluster_name || match.params.clusterId
    } - ${intl.formatMessage(messages.clusters)}`;
    insights.chrome.updateDocumentTitle(
      intl.formatMessage(messages.documentTitle, { subnav })
    );
  }, [cluster, match]);
  return <Cluster cluster={cluster} match={match} />;
};

export default ClusterWrapper;
