import React from 'react';
import { useIntl } from 'react-intl';

import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';

import messages from '../../Messages';
import WorkloadsListTable from '../WorkloadsListTable';
import { Title } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const WorkloadsList = () => {
  const intl = useIntl();
  const chrome = useChrome();

  chrome.updateDocumentTitle(
    intl.formatMessage(messages.documentTitle, {
      subnav: intl.formatMessage(messages.clusters),
    })
  );

  return (
    <React.Fragment>
      <PageHeader className="ins-c-clusters-header">
        <Title headingLevel="h1" ouiaId="page-header">
          Workloads
        </Title>
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <WorkloadsListTable />
      </section>
    </React.Fragment>
  );
};

export default WorkloadsList;
