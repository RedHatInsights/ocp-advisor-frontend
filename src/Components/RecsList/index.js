import React, { lazy, Suspense } from 'react';
import { useIntl } from 'react-intl';

import PageHeader from '@redhat-cloud-services/frontend-components/PageHeader';

import Loading from '../Loading/Loading';
import messages from '../../Messages';
import { Title, Level, LevelItem } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { DownloadExecReport } from '../ExecutiveReport';

const RecsListTable = lazy(
  () => import(/* webpackChunkName: 'RulesTable' */ '../RecsListTable/'),
);

const RecsList = () => {
  const intl = useIntl();
  const chrome = useChrome();

  chrome.updateDocumentTitle(
    intl.formatMessage(messages.documentTitle, {
      subnav: intl.formatMessage(messages.recommendations),
    }),
  );

  return (
    <React.Fragment>
      <PageHeader className="ins-c-recommendations-header">
        <Level>
          <LevelItem>
            <Title headingLevel="h1" ouiaId="page-header">
              {`${intl.formatMessage(messages.insightsHeader)} ${intl
                .formatMessage(messages.recommendations)
                .toLowerCase()}`}
            </Title>
          </LevelItem>
          <LevelItem>
            <DownloadExecReport />
          </LevelItem>
        </Level>
      </PageHeader>
      <section className="pf-l-page__main-section pf-c-page__main-section">
        <Suspense fallback={<Loading />}>
          <RecsListTable />
        </Suspense>
      </section>
    </React.Fragment>
  );
};

export default RecsList;
