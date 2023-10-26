import React from 'react';

import {
  Grid,
  GridItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';

export const ClusterHeader = () => {
  return (
    <Grid id="cluster-header" md={12} hasGutter>
      <GridItem span={8}>
        <Title
          size="2xl"
          headingLevel="h1"
          id="cluster-header-title"
          ouiaId="cluster-name"
        >
          {/* TODO: REPLACE IT WITH A CORRECT HEADER TITLE */}
          TITLE
          {/* {isUninitializedInfo || isFetchingInfo ? (
            <Skeleton size="sm" />
          ) : (
            info?.display_name || clusterId
          )} */}
        </Title>
      </GridItem>
      <GridItem>
        <Stack>
          <StackItem id="cluster-header-uuid">
            <span>UUID:</span>{' '}
            <span>
              {/*
            TODO: REPLACE IT WITH A CORRECT CLUSTER ID
            {clusterId} */}
            </span>
          </StackItem>
        </Stack>
      </GridItem>
    </Grid>
  );
};
