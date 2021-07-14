import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'react-content-loader';
import RuleTable from '@redhat-cloud-services/rule-components/RuleTable/RuleTable';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import ReportDetails from '../ReportDetails/ReportDetails';

import {
  descriptionFilter,
  totalRiskFilter,
  categoryFilter,
  ruleStatusFilter,
} from '@redhat-cloud-services/rule-components/RuleFilters';
import { useIntl } from 'react-intl';
import messages from '../../Messages';
import { Card } from '@patternfly/react-core';

const totalRiskSelector = ({ total_risk }) => (
  <InsightsLabel value={total_risk} />
);

const ClusterRecommendations = ({ cluster, clusterFetchStatus }) => {
  const intl = useIntl();

  return (
    <React.Fragment>
      {clusterFetchStatus !== 'fulfilled ' ? (
        <Card>
          <List />
        </Card>
      ) : (
        <RuleTable
          rules={{ meta: cluster.meta, data: cluster.data }}
          columns={[
            {
              title: intl.formatMessage(messages.name),
              selector: 'description',
            },
            {
              title: intl.formatMessage(messages.added),
              selector: 'created_at',
            },
            {
              title: intl.formatMessage(messages.totalRisk),
              selector: totalRiskSelector,
            },
          ]}
          detail={(report) => <ReportDetails report={report} />}
          filters={{
            descriptionFilter,
            totalRiskFilter,
            categoryFilter,
            ruleStatusFilter,
          }} // TODO: AddedFilter?
          filterValues={{
            ruleStatusFilter: 'enabled',
          }}
        />
      )}
    </React.Fragment>
  );
};

ClusterRecommendations.propTypes = {
  cluster: PropTypes.object.isRequired,
  clusterFetchStatus: PropTypes.string.isRequired,
};

export default ClusterRecommendations;
