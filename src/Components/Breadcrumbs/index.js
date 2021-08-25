import React from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch } from 'react-router-dom';

import { Breadcrumbs } from './Breadcrumbs';

const BreadcrumbsWrapper = ({ current }) => (
  <Breadcrumbs current={current} match={useRouteMatch()} />
);

BreadcrumbsWrapper.propTypes = {
  current: PropTypes.string.isRequired,
};

export default BreadcrumbsWrapper;
