import React from 'react';

import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

import { Breadcrumbs } from './Breadcrumbs';
import { useIntl } from 'react-intl';

export default routerParams(({ match, current }) => {
  const intl = useIntl();
  return <Breadcrumbs current={current} match={match} intl={intl} />;
});
