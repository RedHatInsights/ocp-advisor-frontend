import { EmptyStateVariant } from '@patternfly/react-core/dist/js/components/EmptyState/EmptyState';

import {
  EmptyStateBody,
  EmptyState,
  EmptyStateFooter,
} from '@patternfly/react-core';
import PropTypes from 'prop-types';
import React from 'react';

const MessageState = ({ className, children, icon, text, title, status }) => (
  <EmptyState
    headingLevel="h5"
    titleText={<>{title}</>}
    className={className}
    variant="lg"
    data-ouia-component-id="empty-state"
    data-ouia-component-type="PF6/EmptyState"
    data-ouia-safe={true}
    icon={icon}
    status={status}
  >
    <EmptyStateBody>{text}</EmptyStateBody>
    <EmptyStateFooter>{children}</EmptyStateFooter>
  </EmptyState>
);

MessageState.propTypes = {
  children: PropTypes.any,
  icon: PropTypes.any,
  iconClass: PropTypes.any,
  iconStyle: PropTypes.any,
  text: PropTypes.any,
  title: PropTypes.string,
  variant: PropTypes.any,
  className: PropTypes.string,
  status: PropTypes.string,
};

MessageState.defaultProps = {
  title: '',
  variant: EmptyStateVariant.full,
};

export default MessageState;
