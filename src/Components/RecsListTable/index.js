import React from 'react';

import { RecsListTable } from './RecsListTable';
import { useGetRecsQuery } from '../../Services/SmartProxy';

const RecsListTableWrapper = () => {
  const query = useGetRecsQuery();

  return <RecsListTable query={query} />;
};

export default RecsListTableWrapper;
