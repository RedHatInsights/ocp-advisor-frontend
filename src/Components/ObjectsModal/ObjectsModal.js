import React from 'react';
import { Modal as PfModal } from '@patternfly/react-core';
import { ObjectsModalTable } from '../ObjectsModalTable/ObjectsModalTable';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  WORKLOADS_OBJECTS_TABLE_INITIAL_STATE,
  resetFilters,
  updateWorkloadsObjectsListFilters,
} from '../../Services/Filters';

const ObjectsModal = ({
  isModalOpen,
  setIsModalOpen,
  objects,
  objectsWithNames,
}) => {
  const dispatch = useDispatch();
  const filters = useSelector(
    ({ filters }) => filters.workloadsObjectsListState,
  );
  const updateFilters = (payload) =>
    dispatch(updateWorkloadsObjectsListFilters(payload));

  const onClose = () => {
    setIsModalOpen(false);
    resetFilters(filters, WORKLOADS_OBJECTS_TABLE_INITIAL_STATE, updateFilters);
  };

  return (
    <PfModal
      isOpen={isModalOpen}
      onClose={() => onClose()}
      variant={'medium'}
      title="Objects"
    >
      <ObjectsModalTable
        objects={objects}
        objectsWithNames={objectsWithNames}
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
      display_name: PropTypes.string,
    }),
  ),
  objectsNamesArePresent: PropTypes.arrayOf(
    PropTypes.shape({
      kind: PropTypes.string,
      uid: PropTypes.string,
      display_name: PropTypes.string,
    }),
  ),
  objectsWithNames: PropTypes.bool,
};
