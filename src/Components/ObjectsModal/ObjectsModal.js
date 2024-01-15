import React from 'react';
import { Modal as PfModal } from '@patternfly/react-core';
import { ObjectsModalTable } from '../ObjectsModalTable/ObjectsModalTable';
import PropTypes from 'prop-types';

const ObjectsModal = ({ isModalOpen, setIsModalOpen }) => {
  return (
    <PfModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      variant={'medium'}
    >
      <ObjectsModalTable />
    </PfModal>
  );
};

export default ObjectsModal;

ObjectsModal.propTypes = {
  isModalOpen: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
};
