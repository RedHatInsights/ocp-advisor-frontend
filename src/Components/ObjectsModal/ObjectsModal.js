import React from 'react';
import { Modal as PfModal } from '@patternfly/react-core';
import { ObjectsModalTable } from '../ObjectsModalTable/ObjectsModalTable';
import PropTypes from 'prop-types';
import mockObjects from '../../../cypress/fixtures/api/insights-results-aggregator/objects.json';

const ObjectsModal = ({ isModalOpen, setIsModalOpen }) => {
  return (
    <PfModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      variant={'medium'}
      title="Objects"
    >
      <ObjectsModalTable
        //objects={objects}
        //replace with the real objects when API is implemented
        objects={mockObjects}
      />
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
