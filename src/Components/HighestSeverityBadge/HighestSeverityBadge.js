import React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { TooltipPosition } from '@patternfly/react-core/dist/js/components/Tooltip';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import PropTypes from 'prop-types';

export const HighestSeverityBadge = ({ severities }) => {
  let highestSeverity = 0;

  Object.keys(severities).forEach((severityType) =>
    severities[severityType] > 0 ? (highestSeverity = severityType) : null
  );

  const severityTypeToText = (value) => {
    value = parseInt(value);
    if (value === 1) {
      return 'Low';
    } else if (value === 2) {
      return 'Moderate';
    } else if (value === 3) {
      return 'Important';
    } else {
      return 'Critical';
    }
  };

  const severitiesToDisplay = Object.keys(severities)
    .map((severityType) => {
      return severities[severityType] > 0 ? (
        <p key={severityType}>
          {severities[severityType]} {severityTypeToText(severityType)}
        </p>
      ) : null;
    })
    .reverse();

  return (
    <div>
      <Tooltip position={TooltipPosition.top} content={severitiesToDisplay}>
        <InsightsLabel value={highestSeverity} isCompact />
      </Tooltip>
    </div>
  );
};

HighestSeverityBadge.propTypes = {
  severities: PropTypes.arrayOf(PropTypes.number),
};
