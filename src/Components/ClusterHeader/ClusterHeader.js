import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Grid, GridItem } from '@patternfly/react-core/dist/js/layouts/Grid';
import { Stack, StackItem } from '@patternfly/react-core/dist/js/layouts/Stack';
import { Title } from '@patternfly/react-core/dist/js/components/Title';
import { Dropdown, DropdownToggle, DropdownItem } from '@patternfly/react-core';
import Skeleton from '@redhat-cloud-services/frontend-components/Skeleton';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat/DateFormat';

import messages from '../../Messages';
import { OneLineLoader } from '../../Utilities/Loaders';

export const ClusterHeader = ({ clusterId, clusterData }) => {
  const location = window.location;
  const [isOpen, setIsOpen] = useState(false);
  const intl = useIntl();
  // subscribe to the cluster data query
  const {
    isUninitialized: isUninitializedCluster,
    isFetching: isFetchingCluster,
    data: cluster,
  } = clusterData;

  const dropDownToggle = (isOpen) => {
    setIsOpen(isOpen);
  };

  const dropDownSelect = () => {
    setIsOpen(!isOpen);
  };

  const redirectOCM = (clusterId) => {
    location.replace(
      location.origin +
        (location.pathname.includes('beta') ? `/beta` : '') +
        `/openshift/details/${clusterId}`
    );
  };

  const dropDownItems = [
    <DropdownItem key="link" onClick={() => redirectOCM(clusterId)}>
      <snap>{intl.formatMessage(messages.clusterDetailsRedirect)}</snap>
    </DropdownItem>,
  ];

  return (
    <Grid id="cluster-header" md={12} hasGutter>
      <GridItem span={8}>
        {isUninitializedCluster || isFetchingCluster ? (
          <Skeleton size="sm" />
        ) : (
          <Title
            size="2xl"
            headingLevel="h1"
            id="cluster-header-title"
            ouiaId="cluster-name"
          >
            {clusterData?.data?.report?.meta.cluster_name || clusterId}
          </Title>
        )}
      </GridItem>
      <GridItem span={4} id="cluster-header-dropdown">
        <Dropdown
          position="right"
          onSelect={dropDownSelect}
          autoFocus={false}
          isOpen={isOpen}
          toggle={
            <DropdownToggle id="toggle-id-2" onToggle={dropDownToggle}>
              Action
            </DropdownToggle>
          }
          dropdownItems={dropDownItems}
        />
      </GridItem>
      <GridItem>
        <Stack>
          <StackItem id="cluster-header-uuid">
            <span>UUID: </span>
            <span>{clusterId || intl.formatMessage(messages.unknown)}</span>
          </StackItem>
          <StackItem id="cluster-header-last-seen">
            <span>{intl.formatMessage(messages.lastSeen)}: </span>
            <span>
              {isUninitializedCluster || isFetchingCluster ? (
                <OneLineLoader />
              ) : cluster?.report?.meta?.last_checked_at ? (
                <DateFormat
                  date={cluster?.report?.meta?.last_checked_at}
                  type="exact"
                />
              ) : (
                intl.formatMessage(messages.unknown)
              )}
            </span>
          </StackItem>
        </Stack>
      </GridItem>
    </Grid>
  );
};

ClusterHeader.propTypes = {
  clusterId: PropTypes.string.isRequired,
  displayName: PropTypes.object.isRequired,
  clusterData: PropTypes.object.isRequired,
};
