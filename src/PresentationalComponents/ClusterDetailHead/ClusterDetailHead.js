import React from 'react';
import PropTypes from 'prop-types';

import {
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useIntl } from 'react-intl';
import messages from '../../Messages';

const ClusterDetailHead = ({ uuid, lastSeen }) => {
  const intl = useIntl();

  return (
    <React.Fragment>
      <Grid md={12} hasGutter>
        <GridItem>
          <Title size="2xl" headingLevel="h1">
            {uuid}
          </Title>
        </GridItem>
        <GridItem>
          <Stack>
            <StackItem>
              <span>UUID: </span>
              <span>{uuid || intl.formatMessage(messages.unknown)}</span>
            </StackItem>
            <StackItem>
              <span>{intl.formatMessage(messages.lastSeen)}: </span>
              <span>{lastSeen || intl.formatMessage(messages.unknown)}</span>
            </StackItem>
          </Stack>
        </GridItem>
      </Grid>
    </React.Fragment>
  );
};

ClusterDetailHead.propTypes = {
  uuid: PropTypes.string.isRequired,
  lastSeen: PropTypes.string,
};

export default ClusterDetailHead;
