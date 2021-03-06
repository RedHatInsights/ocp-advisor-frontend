import React from 'react';
import { useIntl } from 'react-intl';

import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';
import Main from '@redhat-cloud-services/frontend-components/Main';

import messages from '../../Messages';
import ClustersListTable from '../ClustersListTable';
import { Title } from '@patternfly/react-core';

const ClustersList = () => {
  const intl = useIntl();
  insights.chrome.updateDocumentTitle(
    intl.formatMessage(messages.documentTitle, {
      subnav: intl.formatMessage(messages.clusters),
    })
  );

  return (
    <React.Fragment>
      <PageHeader className="ins-c-clusters-header">
        <Title headingLevel="h1" ouiaId="page-header">
          {`${intl.formatMessage(messages.insightsHeader)} ${intl
            .formatMessage(messages.clusters)
            .toLowerCase()}`}
        </Title>
      </PageHeader>
      <Main>
        <ClustersListTable />
      </Main>
    </React.Fragment>
  );
};

export default ClustersList;
