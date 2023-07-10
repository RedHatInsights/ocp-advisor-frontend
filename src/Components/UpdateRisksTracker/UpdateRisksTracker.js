import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import get from 'lodash/get';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetUpdateRisksState } from '../../Services/SmartProxy';

const UPDATE_RISKS_TRACK_EVENT_ID = 'ocp-upgrade-risks-viewed';

const UpdateRisksTracker = () => {
  const { analytics, isBeta } = useChrome();
  const { clusterId } = useParams();
  const { isError, isSuccess, data } = useGetUpdateRisksState({
    clusterId,
    preview: isBeta(),
  });

  useEffect(() => {
    if (isError || isSuccess) {
      analytics.track(UPDATE_RISKS_TRACK_EVENT_ID, {
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

export default UpdateRisksTracker;
