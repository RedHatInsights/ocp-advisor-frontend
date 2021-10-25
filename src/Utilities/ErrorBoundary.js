import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';

import { ErrorState } from '../Components/MessageState/EmptyStates';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  componentDidCatch(error) {
    this.setState({
      hasError: true,
      error: error.toString(),
    });
  }

  render() {
    const { error } = this.state;
    if (error) {
      return <ErrorState />;
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default injectIntl(ErrorBoundary);
