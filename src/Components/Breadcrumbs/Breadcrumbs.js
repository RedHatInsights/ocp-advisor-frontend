import React, { useCallback, useEffect, useState } from 'react';

import { Breadcrumb } from '@patternfly/react-core/dist/js/components/Breadcrumb/Breadcrumb';
import { BreadcrumbItem } from '@patternfly/react-core/dist/js/components/Breadcrumb/BreadcrumbItem';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import messages from '../../Messages';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';

const Breadcrumbs = ({ current, match, intl }) => {
  const [items, setItems] = useState([]);
  const buildBreadcrumbs = useCallback(() => {
    const crumbs = [];
    const splitUrl = match.url.split('/');

    // add base
    crumbs.push({
      title: `${intl.formatMessage(messages.insightsHeader)} ${splitUrl[1]}`,
      navigate: `/${splitUrl[1]}`,
    });

    setItems(crumbs);
  }, [intl, match.params.clusterId, match.url]);

  useEffect(() => {
    buildBreadcrumbs();
  }, [buildBreadcrumbs, match.params.clusterId, match.url]);

  return (
    <React.Fragment>
      {items.length > 0 && (
        <Breadcrumb ouiaId="detail">
          {items.map((oneLink, key) => (
            <BreadcrumbItem key={key}>
              {/*<Link to={oneLink.navigate}>{oneLink.title}</Link>*/}
              <span>{oneLink.title}</span>
            </BreadcrumbItem>
          ))}
          <BreadcrumbItem isActive>{current}</BreadcrumbItem>
        </Breadcrumb>
      )}
    </React.Fragment>
  );
};

Breadcrumbs.propTypes = {
  current: PropTypes.string,
  match: PropTypes.object,
  intl: PropTypes.any,
};

export default injectIntl(routerParams(Breadcrumbs));
