import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import Skeleton from '@redhat-cloud-services/frontend-components/Skeleton';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat/DateFormat';

import messages from '../../Messages';
import { OneLineLoader } from '../../Utilities/Loaders';

export const ClusterHeader = ({ clusterId, clusterData, clusterInfo }) => {
  const location = window.location;
  const [isOpen, setIsOpen] = useState(false);
  const intl = useIntl();
  // subscribe to the cluster data query
  const {
    isUninitialized: isUninitializedCluster,
    isFetching: isFetchingCluster,
    data: cluster,
  } = clusterData;

  const {
    isUninitialized: isUninitializedInfo,
    isFetching: isFetchingInfo,
    data: info,
  } = clusterInfo;

  const dropDownItems = [
    <DropdownItem
      key="link"
      to={location.origin + `/openshift/details/${clusterId}`}
    >
      <snap>{intl.formatMessage(messages.clusterDetailsRedirect)}</snap>
    </DropdownItem>,
  ];

  return (
    <Stack hasGutter>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        flexWrap={{ default: 'nowrap' }}
      >
        <FlexItem>
          <Title
            size="2xl"
            headingLevel="h1"
            id="cluster-header-title"
            ouiaId="cluster-name"
          >
            {isUninitializedInfo || isFetchingInfo ? (
              <Skeleton size="sm" />
            ) : (
              info?.display_name || clusterId
            )}
          </Title>
        </FlexItem>
        <FlexItem>
          <Dropdown
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            autoFocus={false}
            isOpen={isOpen}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                id="toggle-id-2"
                onClick={() => setIsOpen(!isOpen)}
              >
                {intl.formatMessage(messages.dropDownActionSingleCluster)}
              </MenuToggle>
            )}
          >
            <DropdownList>{dropDownItems}</DropdownList>
          </Dropdown>
        </FlexItem>
      </Flex>
      <Stack>
        <StackItem id="cluster-header-uuid">
          <span>UUID:</span> <span>{clusterId}</span>
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
    </Stack>
  );
};

ClusterHeader.propTypes = {
  clusterId: PropTypes.string.isRequired,
  clusterData: PropTypes.object.isRequired,
  clusterInfo: PropTypes.shape({
    isUninitialized: PropTypes.bool.isRequired,
    isFetching: PropTypes.bool.isRequired,
    data: PropTypes.shape({
      cluster_id: PropTypes.string,
      display_name: PropTypes.string,
      managed: PropTypes.bool,
      status: PropTypes.string,
    }),
  }),
};
