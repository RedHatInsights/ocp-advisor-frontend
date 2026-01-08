import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ClustersPdf from './ClustersPdf';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-notifications/hooks',
  () => ({
    useAddNotification: jest.fn(),
  }),
);

const useChrome =
  require('@redhat-cloud-services/frontend-components/useChrome').default;
const {
  useAddNotification,
} = require('@redhat-cloud-services/frontend-components-notifications/hooks');

describe('ClustersPdf', () => {
  const mockRequestPdf = jest.fn();
  const mockAddNotification = jest.fn();

  beforeEach(() => {
    useChrome.mockReturnValue({
      requestPdf: mockRequestPdf,
    });
    useAddNotification.mockReturnValue(mockAddNotification);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders export button', () => {
    render(<ClustersPdf filters={{}} />);
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('calls chrome.requestPdf with correct parameters', async () => {
    const user = userEvent.setup();
    const filters = { limit: 50, offset: 0 };
    mockRequestPdf.mockResolvedValue();

    render(<ClustersPdf filters={filters} />);

    const button = screen.getByRole('button', { name: 'Export' });
    await user.click(button);

    await waitFor(() => {
      expect(mockRequestPdf).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            manifestLocation: '/apps/ocp-advisor/fed-mods.json',
            scope: 'ocpAdvisor',
            module: './ClustersPdfBuild',
            fetchDataParams: { filters },
          }),
        }),
      );
    });
  });

  it('shows pending notification on export', async () => {
    const user = userEvent.setup();
    mockRequestPdf.mockResolvedValue();

    render(<ClustersPdf filters={{}} />);

    const button = screen.getByRole('button', { name: 'Export' });
    await user.click(button);

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'info',
          title: 'Preparing export',
        }),
      );
    });
  });

  it('shows success notification on successful export', async () => {
    const user = userEvent.setup();
    mockRequestPdf.mockResolvedValue();

    render(<ClustersPdf filters={{}} />);

    const button = screen.getByRole('button', { name: 'Export' });
    await user.click(button);

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
          title: 'Export successful',
        }),
      );
    });
  });

  it('shows error notification on failed export', async () => {
    const user = userEvent.setup();
    mockRequestPdf.mockRejectedValue(new Error('Export failed'));

    render(<ClustersPdf filters={{}} />);

    const button = screen.getByRole('button', { name: 'Export' });
    await user.click(button);

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Export failed',
        }),
      );
    });
  });

  it('disables button while exporting', async () => {
    const user = userEvent.setup();
    mockRequestPdf.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<ClustersPdf filters={{}} />);

    const button = screen.getByRole('button', { name: 'Export' });
    await user.click(button);

    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });
});
