import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { Alert } from '@patternfly/react-core';
import { StackItem } from '@patternfly/react-core/dist/js/layouts/Stack';
import { Title } from '@patternfly/react-core/dist/js/components/Title';
import messages from '../Messages';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      error: error.toString(),
      info: info,
    });
  }

  render() {
    const intl = useIntl();

    if (this.state.hasError) {
      return (
        <Alert>
          <div>
            {this.state.error}
            {this.state.info.componentStack}
            <Title headingLevel="h4" size="lg">
              {intl.formatMessage(messages.errorStateTitle)}
            </Title>
            <StackItem>{intl.formatMessage(messages.errorStateBody)}</StackItem>
          </div>
        </Alert>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
