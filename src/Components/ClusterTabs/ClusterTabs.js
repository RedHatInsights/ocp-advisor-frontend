import { Card, CardBody, Tab, Tabs } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
import messages from '../../Messages';
import { setSearchParameter } from '../../Utilities/Helpers';
import ClusterRules from '../ClusterRules/ClusterRules';
import { UpdateRisksTable } from '../UpdateRisksTable';
import { UpdateRisksTracker } from '../UpdateRisksTracker';
import useUpdateRisksFeature from '../UpdateRisksTable/useUpdateRisksFeature';

const CLUSTER_TABS = ['recommendations', 'update_risks'];

const ClusterTabs = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const { clusterId } = useParams();
  const updateRisksEnabled = useUpdateRisksFeature(clusterId);

  const [activeKey, setActiveKey] = useState('recommendations');

  useEffect(() => {
    const tabKey = searchParams.get('active_tab');
    setActiveKey(
      updateRisksEnabled && CLUSTER_TABS.includes(tabKey)
        ? tabKey
        : 'recommendations'
    );
  }, [updateRisksEnabled]);

  return (
    <Card isCompact>
      <CardBody>
        <Tabs
          activeKey={activeKey}
          onSelect={(event, key) => {
            setSearchParameter('active_tab', key);
            setActiveKey(key);
          }}
          aria-label="Cluster tabs"
        >
          <Tab
            eventKey="recommendations"
            title={intl.formatMessage(messages.recommendations)}
            ouiaId="recommendations-tab"
          >
            {activeKey === 'recommendations' && <ClusterRules />}
          </Tab>
          {updateRisksEnabled && (
            <Tab
              eventKey="update_risks"
              title={intl.formatMessage(messages.updateRisks)}
              ouiaId="update-risks-tab"
            >
              {activeKey === 'update_risks' && (
                <>
                  <UpdateRisksTracker />
                  <UpdateRisksTable />
                </>
              )}
            </Tab>
          )}
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default ClusterTabs;
