import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from './';

describe('breadcrumbs', () => {
  let props;

  it('renders breadcrumbs: single rec page', () => {
    props = {
      current: 'Cluster update will fail when default SCC gets changed',
    };
    const { asFragment } = render(
      <MemoryRouter
        initialEntries={[
          '/openshift/insights/advisor/recommendations/ccxdev.external.123|ERROR_KEY',
        ]}
        initialIndex={0}
      >
        <IntlProvider locale="en">
          <Breadcrumbs {...props} />
        </IntlProvider>
      </MemoryRouter>
    );

    expect(screen.getAllByTestId('breadcrumb-item')).toHaveLength(1);
    expect(
      screen.getByRole('link', {
        name: /advisor recommendations/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Cluster update will fail when default SCC gets changed')
    ).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders breadcrumbs: single cluster page', () => {
    props = {
      current: 'Cluster with issues',
    };
    const { asFragment } = render(
      <MemoryRouter
        initialEntries={[
          '/openshift/insights/advisor/clusters/d6964a24-a78c-4bdc-8100-17e797efe3d3',
        ]}
        initialIndex={0}
      >
        <IntlProvider locale="en">
          <Breadcrumbs {...props} />
        </IntlProvider>
      </MemoryRouter>
    );

    expect(screen.getAllByTestId('breadcrumb-item')).toHaveLength(1);
    expect(
      screen.getByRole('link', {
        name: /advisor clusters/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Cluster with issues')).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders breadcrumbs: single workloads details page', () => {
    props = {
      current: 'Cluster name 000000001 | Namespace name c1-94f525441c75',
      workloads: true,
    };
    const { asFragment } = render(
      <MemoryRouter
        initialEntries={[
          '/openshift/insights/advisor/workloads/000000001/c1-94f525441c75?sort=-description',
        ]}
        initialIndex={0}
      >
        <IntlProvider locale="en">
          <Breadcrumbs {...props} />
        </IntlProvider>
      </MemoryRouter>
    );

    expect(screen.getAllByTestId('breadcrumb-item')).toHaveLength(1);
    expect(
      screen.getByRole('link', {
        name: /advisor workloads/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cluster name 000000001 | Namespace name c1-94f525441c75'
      )
    ).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });
});
