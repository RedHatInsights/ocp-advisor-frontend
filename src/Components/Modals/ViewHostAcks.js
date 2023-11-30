import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { List } from 'react-content-loader';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { cellWidth } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
import { Button, Modal } from '@patternfly/react-core';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import OutlinedBellIcon from '@patternfly/react-icons/dist/js/icons/outlined-bell-icon';
import { addNotification as notification } from '@redhat-cloud-services/frontend-components-notifications/';

import messages from '../../Messages';
import { enableRuleForCluster } from '../../Services/Acks';

const ViewHostAcks = ({
  handleModalToggle,
  isModalOpen,
  clusters,
  recId,
  afterFn,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const addNotification = (data) => dispatch(notification(data));
  const { data, isFetching, isLoading, refetch } = clusters;
  const hostAcks = data?.disabled || [];
  const [rows, setRows] = useState([]);
  const [unclean, setUnclean] = useState(false);

  const columns = [
    {
      title: intl.formatMessage(messages.clusterName),

      transforms: [cellWidth(50)],
    },
    {
      title: intl.formatMessage(messages.justificationNote),

      transforms: [cellWidth(25)],
    },
    {
      title: intl.formatMessage(messages.dateDisabled),

      transforms: [cellWidth(15)],
    },
    '',
  ];

  const deleteAck = async (host) => {
    try {
      await enableRuleForCluster({ uuid: host.cluster_id, recId });
      refetch();
      setUnclean(true);
    } catch (error) {
      handleModalToggle(false);
      addNotification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  useEffect(() => {
    const rows = hostAcks?.map((item) => ({
      cells: [
        item.cluster_name || item.cluster_id,
        item.justification || intl.formatMessage(messages.none),
        {
          title: (
            <DateFormat date={new Date(item.disabled_at)} type="onlyDate" />
          ),
        },
        {
          title: (
            <Button
              key={item.cluster_id}
              ouiaId="enable"
              isInline
              variant="link"
              onClick={() => deleteAck(item)}
            >
              <OutlinedBellIcon size="sm" />
              {` ${intl.formatMessage(messages.enable)}`}
            </Button>
          ),
        },
      ],
    }));

    if (!isLoading && hostAcks.length === 0) {
      afterFn();
      handleModalToggle(false);
    }
    setRows(rows);
  }, [hostAcks]);

  return (
    <Modal
      width={'75%'}
      title={intl.formatMessage(messages.hostAckModalTitle)}
      isOpen={isModalOpen}
      onClose={() => {
        unclean && afterFn();
        handleModalToggle(false);
      }}
      ouiaId="hosts-disabled"
    >
      {!isFetching ? (
        <Table aria-label="host-ack-table" rows={rows} cells={columns}>
          <TableHeader />
          <TableBody />
        </Table>
      ) : (
        <Table
          aria-label="host-ack-table"
          rows={[
            {
              cells: [{ props: { colSpan: 3 }, title: <List /> }],
            },
          ]}
          cells={columns}
        >
          <TableHeader />
          <TableBody />
        </Table>
      )}
    </Modal>
  );
};

ViewHostAcks.propTypes = {
  isModalOpen: PropTypes.bool,
  handleModalToggle: PropTypes.func,
  clusters: PropTypes.object,
  recId: PropTypes.string,
  afterFn: PropTypes.func,
};

ViewHostAcks.defaultProps = {
  isModalOpen: false,
  handleModalToggle: () => undefined,
  clusters: {},
  recId: '',
  afterFn: () => undefined,
};

export default ViewHostAcks;
