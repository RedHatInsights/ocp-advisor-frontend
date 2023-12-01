import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import rule from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY.json';
import clusterDetailData from '../../../cypress/fixtures/api/insights-results-aggregator/v2/rule/external.rules.rule|ERROR_KEY/clusters_detail.json';
import * as Acks from '../../Services/Acks';
import getStore from '../../Store';
import { Intl } from '../../Utilities/intlHelper';
import { AffectedClustersTable } from './AffectedClustersTable';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
}));

jest.mock('../../Utilities/useFeatureFlag', () => ({
  __esModule: true,
  default: () => true,
}));

describe('AffectedClustersTable', () => {
  it('after all selected, the number is correct', async () => {
    render(
      <MemoryRouter>
        <Intl>
          <Provider store={getStore()}>
            <AffectedClustersTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: clusterDetailData.data,
              }}
              rule={rule.content}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: /select all/i,
      })
    );
    expect(
      screen.getByText(`${clusterDetailData.data.enabled.length} selected`)
    ).toBeVisible();
  });

  describe('disable scenarios', () => {
    const spyDisable = jest.spyOn(Acks, 'disableRuleForCluster');
    const refreshFn = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('can disable all clusters at once', async () => {
      render(
        <MemoryRouter>
          <Intl>
            <Provider store={getStore()}>
              <AffectedClustersTable
                query={{
                  isError: false,
                  isFetching: false,
                  isUninitialized: false,
                  isSuccess: true,
                  data: clusterDetailData.data,
                }}
                rule={rule.content}
                afterDisableFn={refreshFn}
              />
            </Provider>
          </Intl>
        </MemoryRouter>
      );

      await userEvent.click(
        screen.getByRole('checkbox', {
          name: /select all/i,
        })
      );
      await userEvent.click(
        screen.getAllByRole('button', { name: /actions/i })[0]
      );
      await userEvent.click(
        screen.getByText('Disable recommendation for selected clusters')
      );
      await userEvent.click(
        screen.getByRole('button', {
          name: /save/i,
        })
      );
      expect(spyDisable).toHaveBeenCalledTimes(
        clusterDetailData.data.enabled.length
      );
      expect(refreshFn).toHaveBeenCalledTimes(1);
    });

    it('disable modal cancel does not trigger anything', async () => {
      render(
        <MemoryRouter>
          <Intl>
            <Provider store={getStore()}>
              <AffectedClustersTable
                query={{
                  isError: false,
                  isFetching: false,
                  isUninitialized: false,
                  isSuccess: true,
                  data: clusterDetailData.data,
                }}
                rule={rule.content}
                afterDisableFn={refreshFn}
              />
            </Provider>
          </Intl>
        </MemoryRouter>
      );

      await userEvent.click(
        screen.getByRole('checkbox', {
          name: /select all/i,
        })
      );
      await userEvent.click(
        screen.getAllByRole('button', { name: /actions/i })[0]
      );
      await userEvent.click(
        screen.getByText('Disable recommendation for selected clusters')
      );
      await userEvent.click(
        screen.getByRole('button', {
          name: /cancel/i,
        })
      );
      expect(spyDisable).not.toHaveBeenCalled();
      expect(refreshFn).not.toHaveBeenCalled();
    });
  });
});
