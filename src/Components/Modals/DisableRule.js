import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import { Checkbox } from '@patternfly/react-core/dist/js/components/Checkbox/Checkbox';
import { Form } from '@patternfly/react-core/dist/js/components/Form/Form';
import { FormGroup } from '@patternfly/react-core/dist/js/components/Form/FormGroup';
import { Modal } from '@patternfly/react-core/dist/js/components/Modal/Modal';
import { TextInput } from '@patternfly/react-core/dist/js/components/TextInput/TextInput';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';

import messages from '../../Messages';
import { disableRuleForCluster, useSetAckMutation } from '../../Services/Acks';

const DisableRule = ({
  isModalOpen,
  handleModalToggle,
  rule,
  afterFn,
  host,
  hosts,
}) => {
  const intl = useIntl();
  const [justification, setJustificaton] = useState('');
  const [singleSystem, setSingleSystem] = useState(
    host !== undefined || hosts.length > 0
  );
  const [setAck] = useSetAckMutation();
  const dispatch = useDispatch();
  const notify = (data) => dispatch(addNotification(data));

  const bulkHostActions = async () => {
    // disable for a group of hosts (clusters)
    try {
      const requests = hosts.map((h) =>
        disableRuleForCluster({
          uuid: h.id,
          recId: rule.rule_id,
          justification,
        })
      );
      await Promise.all(requests);
      notify({
        variant: 'success',
        dismissable: true,
        timeout: true,
        title: intl.formatMessage(messages.recSuccessfullyDisabledForCluster),
      });
      afterFn && afterFn();
    } catch (error) {
      notify({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  const disableRule = async () => {
    if (!rule.disabled && hosts.length === 0) {
      try {
        if (singleSystem) {
          // disable the rec for this single cluster
          await disableRuleForCluster({
            uuid: host,
            recId: rule.rule_id,
            justification,
          });
          notify({
            variant: 'success',
            timeout: true,
            dismissable: true,
            title: intl.formatMessage(
              messages.recSuccessfullyDisabledForCluster
            ),
          });
        } else {
          // disable the whole rec
          await setAck({
            rule_id: rule.rule_id,
            justification,
          }).unwrap();
          notify({
            variant: 'success',
            timeout: true,
            dismissable: true,
            title: intl.formatMessage(messages.recSuccessfullyDisabled),
          });
        }
        setJustificaton('');
        afterFn && afterFn();
      } catch (error) {
        notify({
          variant: 'danger',
          dismissable: true,
          title: intl.formatMessage(messages.error),
          description: `${error}`,
        });
      }
    } else {
      bulkHostActions();
    }
    handleModalToggle(false);
  };

  return (
    <Modal
      variant="small"
      title={intl.formatMessage(messages.disableRule)}
      isOpen={isModalOpen}
      onClose={() => {
        handleModalToggle();
        setJustificaton('');
      }}
      actions={[
        <Button
          key="confirm"
          variant="primary"
          onClick={() => disableRule()}
          ouiaId="confirm"
        >
          {intl.formatMessage(messages.save)}
        </Button>,
        <Button
          key="cancel"
          variant="link"
          onClick={() => {
            handleModalToggle(false);
            setJustificaton('');
          }}
          ouiaId="cancel"
        >
          {intl.formatMessage(messages.cancel)}
        </Button>,
      ]}
    >
      {intl.formatMessage(messages.disableRuleBody)}
      <Form>
        <FormGroup fieldId="blank-form" />
        {(host || hosts.length > 0) && (
          <FormGroup fieldId="disable-rule-one-system">
            <Checkbox
              isChecked={singleSystem}
              onChange={() => {
                setSingleSystem(!singleSystem);
              }}
              label={
                host
                  ? intl.formatMessage(messages.disableRuleSingleCluster)
                  : intl.formatMessage(messages.disableRuleForClusters)
              }
              id="disable-rule-one-system"
              name="disable-rule-one-system"
            />
          </FormGroup>
        )}
        <FormGroup
          label={intl.formatMessage(messages.justificationNote)}
          fieldId="disable-rule-justification"
        >
          <TextInput
            type="text"
            id="disable-rule-justification"
            aria-describedby="disable-rule-justification"
            value={justification}
            onChange={(text) => setJustificaton(text)}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), disableRule())
            }
          />
        </FormGroup>
      </Form>
    </Modal>
  );
};

DisableRule.propTypes = {
  isModalOpen: PropTypes.bool,
  rule: PropTypes.object,
  handleModalToggle: PropTypes.func,
  afterFn: PropTypes.func,
  host: PropTypes.object,
  hosts: PropTypes.array,
};

DisableRule.defaultProps = {
  isModalOpen: false,
  rule: {},
  handleModalToggle: () => undefined,
  afterFn: () => undefined,
  host: undefined,
  hosts: [],
};

export default DisableRule;
