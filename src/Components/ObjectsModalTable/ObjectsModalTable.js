import React from 'react';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { Title } from '@patternfly/react-core';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';

export const ObjectsModalTable = () => {
  const repositories = [
    {
      name: 'one',
      branches: 'two',
      prs: 'three',
      workspaces: 'four',
      lastCommit: 'five',
    },
    {
      name: 'one - 2',
      branches: null,
      prs: null,
      workspaces: 'four - 2',
      lastCommit: 'five - 2',
    },
    {
      name: 'one - 3',
      branches: 'two - 3',
      prs: 'three - 3',
      workspaces: 'four - 3',
      lastCommit: 'five - 3',
    },
  ];

  const columnNames = {
    name: 'Repositories',
    branches: 'Branches',
    prs: 'Pull requests',
    workspaces: 'Workspaces',
    lastCommit: 'Last commit',
  };

  return (
    <div id="objects-list-table">
      <Title headingLevel="h1" ouiaId="page-header">
        Objects
      </Title>
      <PrimaryToolbar
        pagination={{
          /*           page,
          perPage,
          onSetPage, */
          onPerPageSelect: () => console.log('pageChanged'),
          isCompact: true,
          ouiaId: 'pager',
        }}
      />
      <Table aria-label="Cell widths">
        <Thead>
          <Tr>
            <Th width={15}>{columnNames.name}</Th>
            <Th width={15}>{columnNames.branches}</Th>
            <Th width={40} visibility={['hiddenOnMd', 'visibleOnLg']}>
              {columnNames.prs}
            </Th>
            <Th width={15}>{columnNames.workspaces}</Th>
            <Th width={15}>{columnNames.lastCommit}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {repositories.map((repo) => (
            <Tr key={repo.name}>
              <Td dataLabel={columnNames.name}>{repo.name}</Td>
              <Td dataLabel={columnNames.branches}>{repo.branches}</Td>
              <Td
                dataLabel={columnNames.prs}
                visibility={['hiddenOnMd', 'visibleOnLg']}
              >
                {repo.prs}
              </Td>
              <Td dataLabel={columnNames.workspaces}>{repo.workspaces}</Td>
              <Td dataLabel={columnNames.lastCommit}>{repo.lastCommit}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};
