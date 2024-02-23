import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import { Breadcrumb, BreadcrumbItem } from '@patternfly/react-core';

import messages from '../../Messages';

const Breadcrumbs = ({ current, workloads }) => {
  const intl = useIntl();
  const location = useLocation();
  const splitUrl = location.pathname.split('/');

  return (
    <div>
      <Breadcrumb ouiaId="detail" data-testid="breadcrumb-item">
        <BreadcrumbItem className="breadcrumb-item">
          <Link to={workloads ? `../..` : `..`} relative="path">
            {`${intl.formatMessage(messages.insightsHeader)} ${splitUrl[4]}`}
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
  workloads: PropTypes.boolean,
};

export default Breadcrumbs;
