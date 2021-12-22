import React, { lazy, Suspense } from 'react';
import { useIntl } from 'react-intl';

import Main from '@redhat-cloud-services/frontend-components/Main';
import PageHeader, {
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';

import Loading from '../Loading/Loading';
import messages from '../../Messages';

const RecsListTable = lazy(() =>
  import(/* webpackChunkName: 'RulesTable' */ '../RecsListTable/')
);

const RecsList = () => {
  const intl = useIntl();
  document.title = intl.formatMessage(messages.documentTitle, {
    subnav: 'Recommendations',
  });

  return (
    <React.Fragment>
      <PageHeader className="ins-c-recommendations-header">
        <PageHeaderTitle
          title={`${intl.formatMessage(messages.insightsHeader)} ${intl
            .formatMessage(messages.recommendations)
            .toLowerCase()}`}
        />
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
