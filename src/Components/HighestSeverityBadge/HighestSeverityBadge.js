import React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { TooltipPosition } from '@patternfly/react-core/dist/js/components/Tooltip';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import PropTypes from 'prop-types';
import { severityTypeToText } from '../Common/Tables';

export const HighestSeverityBadge = ({ highestSeverity, severities }) => {
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
  severities: PropTypes.object,
  highestSeverity: PropTypes.number,
};
