import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

import { useGetClusterByIdQuery } from '../../Services/SmartProxy';
import messages from '../../Messages';
import { Cluster } from './Cluster';

const ClusterWrapper = () => {
  const intl = useIntl();
  const { clusterId } = useParams();
  const cluster = useGetClusterByIdQuery({
    clusterId,
    includeDisabled: false,
  });
  const chrome = useChrome();

  useEffect(() => {
    cluster.refetch();
  }, [clusterId]);

  useEffect(() => {
    const subnav = `${
      cluster?.data?.report?.meta?.cluster_name || clusterId
    } - ${intl.formatMessage(messages.clusters)}`;
    chrome.updateDocumentTitle(
      intl.formatMessage(messages.documentTitle, { subnav })
    );
  }, [cluster, clusterId]);
  return <Cluster cluster={cluster} clusterId={clusterId} />;
};

export default ClusterWrapper;
