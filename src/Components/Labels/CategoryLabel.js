import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { camelCase } from 'lodash';

import { Label } from '@patternfly/react-core/dist/js/components/Label/index';
import { LabelGroup } from '@patternfly/react-core/dist/js/components/LabelGroup/LabelGroup';
import LockIcon from '@patternfly/react-icons/dist/esm/icons/lock-icon';
import PortIcon from '@patternfly/react-icons/dist/esm/icons/port-icon';
import AutomationIcon from '@patternfly/react-icons/dist/esm/icons/automation-icon';
import SyncAltIcon from '@patternfly/react-icons/dist/esm/icons/sync-icon';

import messages from '../../Messages';
import { RULE_CATEGORIES } from '../../AppConstants';

const CATEGORY_ICONS = {
  security: <LockIcon />,
  service_availability: <AutomationIcon />,
  performance: <PortIcon />,
  fault_tolerance: <SyncAltIcon />,
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
