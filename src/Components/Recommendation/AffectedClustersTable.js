import React from 'react';
import { useIntl } from 'react-intl';

import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { global_success_color_100 as globalSuccessColor100 } from '@patternfly/react-tokens';
import { CheckCircleIcon } from '@patternfly/react-icons';
import { Card, CardBody } from '@patternfly/react-core';

import messages from '../../Messages';
import MessageState from '../MessageState/MessageState';

const AffectedClustersTable = () => {
  const intl = useIntl();
  const filterConfig = {
    items: [{ label: 'Name' }, { label: 'Total Risk' }],
    isDisabled: true,
  };

  return (
    <React.Fragment>
      <PrimaryToolbar
        filterConfig={filterConfig}
        pagination={{
          itemCount: 0,
          page: 0,
          perPage: 0,
        }}
      />
      <Card>
        <CardBody>
          <MessageState
            icon={CheckCircleIcon}
            iconStyle={{ color: globalSuccessColor100.value }}
            title={intl.formatMessage(messages.noClusters)}
            text={intl.formatMessage(messages.noClustersBody)}
          />
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default AffectedClustersTable;
