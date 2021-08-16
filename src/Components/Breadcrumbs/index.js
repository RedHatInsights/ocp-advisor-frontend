import React from 'react';

import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

import { Breadcrumbs } from './Breadcrumbs';
import { injectIntl } from 'react-intl';

export default injectIntl(
  routerParams(({ match, current, intl }) => (
    <Breadcrumbs current={current} match={match} intl={intl} />
  ))
);
