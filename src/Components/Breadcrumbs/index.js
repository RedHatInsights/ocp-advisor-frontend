import React from 'react';

import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

import { Breadcrumbs } from './Breadcrumbs';

export default routerParams(({ match, current }) => (
  <Breadcrumbs current={current} match={match} />
));
