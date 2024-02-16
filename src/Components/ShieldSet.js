import React from 'react';
import PropTypes from 'prop-types';
import { SecurityIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { Icon, Tooltip } from '@patternfly/react-core';
import { SEVERITY_OPTIONS, remappingSeverity } from '../Utilities/Workloads';

const ShieldSet = ({ hits_by_severity, basePath }) => {
  const DISABLED_COLOR = 'var(--pf-global--disabled-color--200)';
  const severitiesRemapped = remappingSeverity(hits_by_severity, 'label');
  return (
    <div className="shield-set">
      {SEVERITY_OPTIONS.map((severityOption, index) => (
        <Tooltip
          key={severityOption.value}
          content={`${severityOption.label} severity`}
        >
          {severityOption.hasIcon &&
            (severitiesRemapped[severityOption.value] === 0 ? (
              <a className="disabled-shield nowrap">
                <Icon style={{ color: DISABLED_COLOR }}>
                  <SecurityIcon />
                </Icon>
                <span>0</span>
              </a>
            ) : (
              <Link
                key={severityOption.value}
                to={`${basePath}?total_risk=${SEVERITY_OPTIONS[index].indexNumber}`}
                className="nowrap"
              >
                <Icon style={{ color: severityOption.iconColor }}>
                  <SecurityIcon />
                </Icon>
                <span>{severitiesRemapped[severityOption.value]}</span>
              </Link>
            ))}
        </Tooltip>
      ))}
    </div>
  );
};

ShieldSet.propTypes = {
  hits_by_severity: PropTypes.shape({
    critical: PropTypes.number,
    important: PropTypes.number,
    moderate: PropTypes.number,
    low: PropTypes.number,
  }).isRequired,
  linkTo: PropTypes.string,
  basePath: PropTypes.string,
};

export default ShieldSet;
