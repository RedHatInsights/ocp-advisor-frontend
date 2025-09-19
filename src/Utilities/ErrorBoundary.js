import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import { Bullseye } from '@patternfly/react-core';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  componentDidCatch() {
    this.setState({
      hasError: true,
    });
  }

  render() {
    return this.state.hasError ? (
      <Bullseye>
        <ErrorState />
      </Bullseye>
    ) : (
      this.props.children
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default injectIntl(ErrorBoundary);
