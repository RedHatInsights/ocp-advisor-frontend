import React, { lazy, Suspense } from 'react';
import { useIntl } from 'react-intl';

import Main from '@redhat-cloud-services/frontend-components/Main';
import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';

import Loading from '../Loading/Loading';
import messages from '../../Messages';
import { Title } from '@patternfly/react-core';

const RecsListTable = lazy(() =>
  import(/* webpackChunkName: 'RulesTable' */ '../RecsListTable/')
);

const RecsList = () => {
  const intl = useIntl();
  insights.chrome.updateDocumentTitle(
    intl.formatMessage(messages.documentTitle, {
      subnav: intl.formatMessage(messages.recommendations),
    })
  );

  return (
    <React.Fragment>
      <PageHeader className="ins-c-recommendations-header">
        <Title headingLevel="h1" ouiaId="page-header">
          {`${intl.formatMessage(messages.insightsHeader)} ${intl
            .formatMessage(messages.recommendations)
            .toLowerCase()}`}
        </Title>
      </PageHeader>
      <Main>
        <Suspense fallback={<Loading />}>
          <RecsListTable />
        </Suspense>
      </Main>
    </React.Fragment>
  );
};

export default RecsList;
