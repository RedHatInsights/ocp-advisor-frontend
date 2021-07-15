import React from 'react';
import PropTypes from 'prop-types';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

// Rule fields processing: https://docs.google.com/document/d/1D0ZLD6-2DZqBX1cUHJY2vL2QAD0dIAzY3O3xFNlEsVg/edit?usp=sharing

const ReportDetails = ({ report }) => {
  console.log({
    ...report,
    details: report.extra_data,
    resolution: report.resolution,
  });

  return (
    <AsyncComponent
      appName="advisor"
      module="./AdvisorReportDetails"
      // TODO: make API rename `extra_data` to `details` or modify AdvisorReportDetails property
      report={{
        ...report,
        details: report.extra_data,
        resolution: {
          resolution: report.resolution,
        },
      }}
    />
  );
};

ReportDetails.propTypes = {
  report: PropTypes.object.isRequired,
};

export default ReportDetails;
