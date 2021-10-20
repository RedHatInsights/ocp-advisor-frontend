import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { Alert, EmptyState } from '@patternfly/react-core';
import { StackItem } from '@patternfly/react-core/dist/js/layouts/Stack';
import { Title } from '@patternfly/react-core/dist/js/components/Title';
import messages from '../Messages';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  render() {
    const { error, componentStack } = this.state;
    const intl = useIntl();

    if (this.state.hasError) {
      return (
        <EmptyState>
          <Alert>
            <div>
              {error}
              {componentStack}
              <Title headingLevel="h4" size="lg">
                {intl.formatMessage(messages.errorStateTitle)}
              </Title>
              <StackItem>
                {intl.formatMessage(messages.errorStateBody)}
              </StackItem>
              <snap>TEST</snap>
            </div>
          </Alert>
        </EmptyState>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
