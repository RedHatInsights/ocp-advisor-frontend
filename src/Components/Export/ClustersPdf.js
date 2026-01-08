import React, { useState } from 'react';
import { Button, Tooltip } from '@patternfly/react-core';
import { ExportIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const exportNotifications = {
  pending: {
    variant: 'info',
    title: 'Preparing export',
    description: 'Your PDF is being generated...',
  },
  success: {
    variant: 'success',
    title: 'Export successful',
    description: 'Your PDF has been downloaded.',
  },
  error: {
    variant: 'danger',
    title: 'Export failed',
    description: 'There was a problem generating your PDF.',
  },
};

const ClustersPdf = ({ filters }) => {
  const addNotification = useAddNotification();
  const [loading, setLoading] = useState(false);
  const chrome = useChrome();

  const handleExport = async () => {
    setLoading(true);
    addNotification(exportNotifications.pending);

    try {
      await chrome.requestPdf({
        filename: `OCP_Advisor_clusters--${new Date()
          .toUTCString()
          .replace(/ /g, '-')}.pdf`,
        payload: {
          manifestLocation: '/apps/ocp-advisor/fed-mods.json',
          scope: 'ocpAdvisor',
          module: './ClustersPdfBuild',
          fetchDataParams: { filters },
          additionalData: {},
        },
      });
      addNotification(exportNotifications.success);
    } catch (error) {
      console.error('PDF export error:', error);
      addNotification(exportNotifications.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip content="Export to PDF">
      <Button
        variant="plain"
        aria-label="Export"
        onClick={handleExport}
        isDisabled={loading}
        icon={<ExportIcon />}
      />
    </Tooltip>
  );
};

ClustersPdf.propTypes = {
  filters: PropTypes.object,
};

export default ClustersPdf;
