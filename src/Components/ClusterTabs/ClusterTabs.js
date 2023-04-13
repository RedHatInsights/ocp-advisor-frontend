import { Card, CardBody, Tab, Tabs } from '@patternfly/react-core';
import React, { useState } from 'react';

import { useIntl } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import messages from '../../Messages';
import { setSearchParameter } from '../../Utilities/Helpers';
import { useUpgradeRisksFeatureFlag } from '../../Utilities/useFeatureFlag';
import ClusterRules from '../ClusterRules/ClusterRules';
import { UpgradeRisksTable } from '../UpgradeRisksTable';

const CLUSTER_TABS = ['recommendations', 'upgrade_risks'];

const ClusterTabs = () => {
  const intl = useIntl();
  const upgradeRisksEnabled = useUpgradeRisksFeatureFlag();
  const [searchParams] = useSearchParams();

  const [activeKey, setActiveKey] = useState(() => {
    const activeTab = searchParams.get('active_tab');
    return upgradeRisksEnabled
      ? CLUSTER_TABS.includes(activeTab)
        ? activeTab
        : 'recommendations'
      : 'recommendations';
  });

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
          >
            {activeKey === 'recommendations' && <ClusterRules />}
          </Tab>
          <Tab
            eventKey="upgrade_risks"
            title={intl.formatMessage(messages.upgradeRisks)}
          >
            {upgradeRisksEnabled && activeKey === 'upgrade_risks' && (
              <UpgradeRisksTable />
            )}
          </Tab>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default ClusterTabs;
