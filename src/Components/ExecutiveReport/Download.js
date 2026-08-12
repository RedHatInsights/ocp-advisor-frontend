import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import { ExportIcon } from '@patternfly/react-icons';
import { Button } from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const exportNotifications = {
  pending: {
    variant: 'info',
    title: 'Preparing export',
    description: 'Your executive report is being generated...',
  },
  success: {
    variant: 'success',
    title: 'Export successful',
    description: 'Your executive report has been downloaded.',
  },
  error: {
    variant: 'danger',
    title: 'Export failed',
    description: 'There was a problem generating your report.',
  },
};

const DownloadExecReport = ({ isDisabled }) => {
  const addNotification = useAddNotification();
  const chrome = useChrome();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    addNotification(exportNotifications.pending);

    try {
      await chrome.requestPdf({
        filename: `OCP-Advisor-Executive-Report--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`,
        payload: {
          manifestLocation: '/apps/ocp-advisor/fed-mods.json',
          scope: 'ocpAdvisor',
          module: './BuildExecReport',
          fetchDataParams: {
            limit: 3,
            sort: '-total_risk,-impacted_count',
            impacting: true,
          },
          additionalData: {},
        },
      });
      addNotification(exportNotifications.success);
    } catch (error) {
      console.error('Executive report export error:', error);
      addNotification(exportNotifications.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="link"
      isInline
      isDisabled={isDisabled || loading}
      icon={<ExportIcon />}
      aria-label="Download Executive Report"
    >
      Download executive report
    </Button>
  );
};

DownloadExecReport.propTypes = {
  isDisabled: PropTypes.bool,
};

export default DownloadExecReport;
