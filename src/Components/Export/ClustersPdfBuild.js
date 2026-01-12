import PropTypes from 'prop-types';
import React from 'react';
import {
  t_color_red_50,
  t_global_font_weight_heading_default,
  t_global_text_color_link_default,
  t_global_spacer_md,
} from '@patternfly/react-tokens';
import TablePage from './TablePage';

const styles = {
  bold: { fontWeight: t_global_font_weight_heading_default.value },
  link: { color: t_global_text_color_link_default.value },
  text: { fontSize: 12 },
  textMargin: { marginTop: t_global_spacer_md.value },
  document: {
    paddingTop: '24px',
    paddingLeft: '32px',
    paddingRight: '32px',
  },
};

export const fetchData = async (createAsyncRequest, options) => {
  const clusters = createAsyncRequest('ccx-data-pipeline', {
    method: 'GET',
    url: '/api/insights-results-aggregator/v2/clusters',
  });

  const data = await Promise.all([clusters]);
  return { data: data[0].data, options };
};

const ClustersPdfBuild = ({ asyncData }) => {
  const { data, options } = asyncData.data;

  return (
    <div style={styles.document}>
      <span
        style={{
          fontSize: '24px',
          color: t_color_red_50.value,
        }}
      >
        Red Hat Insights
      </span>
      <br />
      <span
        style={{
          fontSize: '32px',
          color: t_color_red_50.value,
        }}
      >
        OpenShift Advisor: Clusters
      </span>
      <div key="cluster-count" style={{ ...styles.text, ...styles.textMargin }}>
        Total Clusters:
        <span
          key="cluster-count-count"
          style={{ ...styles.bold, ...styles.text }}
        >
          {' '}
          {data?.length || 0}
        </span>
      </div>
      <div key="filters" style={{ ...styles.text, ...styles.textMargin }}>
        Filters Applied:
      </div>
      <div key="filters-values" style={{ ...styles.bold, ...styles.text }}>
        {options.filters &&
          Object.entries(options.filters).map(([key, value]) => {
            return <span key={key}>{`${key}: ${value}     `}</span>;
          })}
      </div>
      <div>
        <TablePage clusters={data} styles={styles} />
      </div>
    </div>
  );
};

ClustersPdfBuild.propTypes = {
  asyncData: PropTypes.object,
  additionalData: PropTypes.object,
};

export default ClustersPdfBuild;
