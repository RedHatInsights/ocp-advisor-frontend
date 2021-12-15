import React from 'react';
import { useIntl } from 'react-intl';

import PageHeader, {
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';

import messages from '../../Messages';
import ClustersListTable from '../ClustersListTable';

const ClustersList = () => {
  const intl = useIntl();

  return (
    <React.Fragment>
      <PageHeader className="ins-c-clusters-header">
        <PageHeaderTitle
          title={`${intl.formatMessage(messages.insightsHeader)} ${intl
            .formatMessage(messages.clusters)
            .toLowerCase()}`}
        />
      </PageHeader>
      <Main>
        <ClustersListTable />
      </Main>
    </React.Fragment>
  );
};

export default ClustersList;
