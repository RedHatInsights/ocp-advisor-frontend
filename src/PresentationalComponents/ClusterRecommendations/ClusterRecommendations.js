import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'react-content-loader';
import RuleTable from '@redhat-cloud-services/rule-components/RuleTable';
import InsightsLabel from '@redhat-cloud-services/frontend-components/InsightsLabel';
import ReportDetails from '../ReportDetails/ReportDetails';

import {
  descriptionFilter,
  totalRiskFilter,
  categoryFilter,
  ruleStatusFilter,
} from '@redhat-cloud-services/rule-components/RuleFilters';

const totalRiskSelector = ({ total_risk }) => (
  <InsightsLabel value={total_risk} />
);

const ClusterRecommendations = ({ cluster, clusterFetchStatus }) => {
  return (
    <React.Fragment>
      {clusterFetchStatus !== 'fulfilled ' ? (
        <List />
      ) : (
        <RuleTable
          rules={{ meta: cluster.meta, data: cluster.data }}
          columns={[
            {
              title: 'Name',
              selector: 'description',
            },
            {
              title: 'Added',
              selector: 'created_at',
            },
            {
              title: 'Total risk',
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
