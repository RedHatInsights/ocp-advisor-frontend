import React from 'react';
import { Card, CardBody } from '@patternfly/react-core';
import { List } from 'react-content-loader';

const Loading = () => (
  <Card ouiaId="loading-skeleton">
    <CardBody>
      <List />
    </CardBody>
  </Card>
);

export default Loading;
