import {
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core/dist/js/components/Tooltip/Tooltip';

import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';
import messages from '../../Messages';

const RuleLabels = ({ rule }) => {
  const intl = useIntl();
  return (
    <React.Fragment>
      {rule.disabled && (
        <Tooltip
          content={intl.formatMessage(messages.ruleIsDisabledTooltip)}
          position={TooltipPosition.right}
        >
          <Label color="gray">{intl.formatMessage(messages.disabled)}</Label>
        </Tooltip>
      )}
    </React.Fragment>
  );
};

RuleLabels.propTypes = {
  rule: PropTypes.object,
};

export default RuleLabels;
