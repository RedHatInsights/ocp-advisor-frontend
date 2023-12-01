import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import camelCase from 'lodash/camelCase';

import { Label, LabelGroup } from '@patternfly/react-core';
import LockIcon from '@patternfly/react-icons/dist/js/icons/lock-icon';
import PortIcon from '@patternfly/react-icons/dist/js/icons/port-icon';
import AutomationIcon from '@patternfly/react-icons/dist/js/icons/automation-icon';
import SyncAltIcon from '@patternfly/react-icons/dist/js/icons/sync-icon';
import OptimizeIcon from '@patternfly/react-icons/dist/js/icons/optimize-icon';

import messages from '../../Messages';
import { RULE_CATEGORIES } from '../../AppConstants';

const CATEGORY_ICONS = {
  security: <LockIcon />,
  service_availability: <AutomationIcon />,
  performance: <PortIcon />,
  fault_tolerance: <SyncAltIcon />,
  best_practice: <OptimizeIcon />,
};

export const extractCategories = (tags) =>
  tags.filter((t) => Object.keys(RULE_CATEGORIES).includes(t));

const CategoryLabel = ({ tags }) => {
  const intl = useIntl();

  return (
    <LabelGroup numLabels={1} isCompact>
      {extractCategories(tags).map((tag, key) => (
        <Label
          key={key}
          icon={CATEGORY_ICONS[tag]}
          variant="outline"
          color="blue"
          isCompact
        >
          {intl.formatMessage(messages[camelCase(tag)])}
        </Label>
      ))}
    </LabelGroup>
  );
};

CategoryLabel.propTypes = {
  tags: PropTypes.array.isRequired,
};

export default CategoryLabel;
