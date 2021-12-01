import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  Button,
  Form,
  FormGroup,
  Modal,
  TextInput,
} from '@patternfly/react-core';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';

import messages from '../../Messages';
import { useSetAckMutation } from '../../Services/Acks';

const DisableRule = ({ isModalOpen, handleModalToggle, rule, afterFn }) => {
  const intl = useIntl();
  const [justification, setJustificaton] = useState('');
  const [setAck] = useSetAckMutation();
  const dispatch = useDispatch();
  const notification = (data) => dispatch(addNotification(data));

  const disableRule = async () => {
    const options = {
      rule_id: rule.rule_id,
      justification,
    };
    try {
      await setAck(options).unwrap();
      notification({
        variant: 'success',
        timeout: true,
        dismissable: true,
        title: intl.formatMessage(messages.recSuccessfullyDisabled),
      });
      setJustificaton('');
      afterFn && afterFn();
    } catch (error) {
      notification({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
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
};

DisableRule.defaultProps = {
  isModalOpen: false,
  rule: {},
  handleModalToggle: () => undefined,
  afterFn: () => undefined,
};

export default DisableRule;
