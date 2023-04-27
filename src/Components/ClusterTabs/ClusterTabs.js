import { Card, CardBody, Tab, Tabs } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import { useParams, useSearchParams } from 'react-router-dom';
import messages from '../../Messages';
import { setSearchParameter } from '../../Utilities/Helpers';
import ClusterRules from '../ClusterRules/ClusterRules';
import { UpgradeRisksTable } from '../UpgradeRisksTable';
import { UpgradeRisksTracker } from '../UpgradeRisksTracker';
import useUpgradeRisksFeature from '../UpgradeRisksTable/useUpgradeRisksFeature';

const CLUSTER_TABS = ['recommendations', 'upgrade_risks'];

const ClusterTabs = () => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const { clusterId } = useParams();
  const upgradeRisksEnabled = useUpgradeRisksFeature(clusterId);

  const [activeKey, setActiveKey] = useState('recommendations');

  useEffect(() => {
    const tabKey = searchParams.get('active_tab');
    setActiveKey(
      upgradeRisksEnabled && CLUSTER_TABS.includes(tabKey)
        ? tabKey
        : 'recommendations'
    );
  }, [upgradeRisksEnabled]);

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
          {upgradeRisksEnabled && (
            <Tab
              eventKey="upgrade_risks"
              title={intl.formatMessage(messages.upgradeRisks)}
              ouiaId="upgrade-risks-tab"
            >
              {activeKey === 'upgrade_risks' && (
                <>
                  <UpgradeRisksTracker />
                  <UpgradeRisksTable />
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
