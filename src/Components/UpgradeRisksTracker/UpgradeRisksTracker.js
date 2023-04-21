import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import get from 'lodash/get';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUpgradeRisksState } from '../../Services/SmartProxy';

const UPGRADE_RISKS_TRACK_EVENT_ID = 'test.foobar';

const UpgradeRisksTracker = () => {
  const { analytics } = useChrome();
  const { clusterId } = useParams();
  const { isError, isSuccess, data } = useGetUpgradeRisksState({
    id: clusterId,
  });

  useEffect(() => {
    if (isError || isSuccess) {
      analytics.track(UPGRADE_RISKS_TRACK_EVENT_ID, {
        cluster_id: clusterId,
        upgrade_recommended: get(
          data,
          'upgrade_recommendation.upgrade_recommended',
          null
        ),
      });
    }
  }, [isError, isSuccess]);

  return <></>;
};

export default UpgradeRisksTracker;
