import React from 'react';
import PropTypes from 'prop-types';
import { Card } from '@patternfly/react-core/dist/js/components/Card/Card';
import { CardBody } from '@patternfly/react-core/dist/js/components/Card/CardBody';
import { List } from 'react-content-loader';

const Loading = ({ id }) => (
  <Card {...(id ? { id } : {})}>
    <CardBody>
      <List />
    </CardBody>
  </Card>
);

Loading.propTypes = {
  id: PropTypes.string,
};

export default Loading;
