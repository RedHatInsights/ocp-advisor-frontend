import React from 'react';

import { RecsListTable } from './RecsListTable';
import { useGetRecsQuery } from '../../Services/SmartProxy';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const RecsListTableWrapper = () => {
  const chrome = useChrome();
  const query = useGetRecsQuery({ preview: chrome.isBeta() });

  return <RecsListTable query={query} />;
};

export default RecsListTableWrapper;
