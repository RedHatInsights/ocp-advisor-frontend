import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core/';

import messages from '../../Messages';

const Breadcrumbs = ({ current }) => {
  const intl = useIntl();
  const location = useLocation();
  const splitUrl = location.pathname.split('/');

  return (
    <div>
      <Breadcrumb ouiaId="detail">
        <BreadcrumbItem className="breadcrumb-item">
          <Link to={`/${splitUrl[1]}`}>
            {`${intl.formatMessage(messages.insightsHeader)} ${splitUrl[1]}`}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem className="breadcrumb-item" isActive>
          {current}
        </BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
};

Breadcrumbs.propTypes = {
  current: PropTypes.string,
};

export default Breadcrumbs;
