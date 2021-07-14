import { Card } from '@patternfly/react-core/dist/js/components/Card/Card';
import { CardBody } from '@patternfly/react-core/dist/js/components/Card/CardBody';
import { List } from 'react-content-loader';
import React from 'react';
const Loading = () => (
  <React.Fragment>
    <Card>
      <CardBody>
        <List />
      </CardBody>
    </Card>
  </React.Fragment>
);

export default Loading;
