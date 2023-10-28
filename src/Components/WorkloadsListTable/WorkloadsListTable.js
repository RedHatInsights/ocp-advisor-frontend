import React, { useEffect } from 'react';
import useFeatureFlag, {
  WORKLOADS_ENABLE_FLAG,
} from '../../Utilities/useFeatureFlag';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { PaginationVariant } from '@patternfly/react-core/dist/js/components/Pagination/Pagination';
import { WORKLOADS_LIST_COLUMNS } from '../../AppConstants';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { Link } from 'react-router-dom';
import { BASE_PATH } from '../../Routes';
import { HighestSeverityBadge } from '../HighestSeverityBadge/HighestSeverityBadge';
import { Pagination } from '@patternfly/react-core';

const workloadsData = [
  {
    workload_id: 'asd4134asd-1234241',
    workload_name: 'Workload 1',
    risks: {
      1: 2,
      2: 0,
      3: 3,
      4: 1,
    },
    recommendations: 4,
    objects: 14,
    lastSeen: '2023-10-30T09:55:52Z',
  },
  {
    workload_id: 'worklooaaaasd-2',
    workload_name: 'Workload 2',
    risks: {
      1: 1,
      2: 3,
      3: 2,
      4: 0,
    },
    recommendations: 5,
    objects: 3,
    lastSeen: '2023-10-30T05:55:52Z',
  },
];

const WorkloadsListTable = () => {
  const workloadsEnabled = useFeatureFlag(WORKLOADS_ENABLE_FLAG);
  console.log(workloadsEnabled, 'FLAG');

  const workloads = workloadsData;

  const [rows, setRows] = React.useState([]);

  useEffect(() => {
    setRows(buildRows(workloads));
  }, [workloads]);

  const buildRows = (items) => {
    return items.map((item, index) => {
      return {
        entity: item,
        cells: [
          <span key={index}>
            <Link to={`${BASE_PATH}/workloads/${item.workload_id}`}>
              {item.workload_name || item.workload_id}
            </Link>
          </span>,
          item.recommendations,
          <span key={index}>
            <HighestSeverityBadge severities={item.risks} />
          </span>,
          item.objects,
          <span key={Math.random()}>
            <DateFormat
              extraTitle="Last seen: "
              date={item.lastSeen}
              variant="relative"
            />
          </span>,
        ],
      };
    });
  };

  return (
    <div id="workloads-list-table">
      <PrimaryToolbar
        pagination={{
          itemCount: 2,
          page: 1,
          perPage: 20,
          onSetPage: () => {},
          onPerPageSelect: () => {},
          isCompact: true,
          ouiaId: 'pager',
        }}
      />
      <Table
        aria-label="Table of workloads"
        ouiaId="workloads"
        variant={TableVariant.compact}
        cells={WORKLOADS_LIST_COLUMNS}
        rows={rows}
        isStickyHeader
      >
        <TableHeader />
        <TableBody />
      </Table>
      <Pagination
        ouiaId="pager"
        itemCount={2}
        page={1}
        perPage={20}
        onSetPage={() => {}}
        onPerPageSelect={() => {}}
        widgetId={`pagination-options-menu-bottom`}
        variant={PaginationVariant.bottom}
      />
    </div>
  );
};

export { WorkloadsListTable };
