import React from 'react';
import { Modal as PfModal } from '@patternfly/react-core';
import { ObjectsModalTable } from '../ObjectsModalTable/ObjectsModalTable';
import PropTypes from 'prop-types';

const ObjectsModal = ({ isModalOpen, setIsModalOpen, objects }) => {
  return (
    <PfModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      variant={'medium'}
    >
      <ObjectsModalTable objects={objects} />
    </PfModal>
  );
};

export default ObjectsModal;

ObjectsModal.propTypes = {
  isModalOpen: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
  objects: PropTypes.arrayOf(
    PropTypes.shape({
      kind: PropTypes.string,
      uid: PropTypes.string,
    })
  ),
};
