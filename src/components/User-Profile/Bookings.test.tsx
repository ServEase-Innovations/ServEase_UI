import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bookings from './Bookings';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppUser } from 'src/context/AppUserContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';

jest.mock('@auth0/auth0-react');
jest.mock('src/context/AppUserContext');
jest.mock('../../services/axiosInstance', () => ({
  get: jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } })),
  post: jest.fn().mockReturnValue(Promise.resolve({ data: {} })),
  put: jest.fn().mockReturnValue(Promise.resolve({ data: {} })),
}));
jest.mock('src/services/utilsInstance', () => ({
  get: jest.fn().mockReturnValue(Promise.resolve({ data: { settings: {} } })),
}));
jest.mock('src/services/paymentInstance', () => ({
  get: jest.fn().mockImplementation((url) => {
    if (url.includes('today-bookings')) {
      return Promise.resolve({ data: { bookings: [] } });
    }
    return Promise.resolve({ 
      data: { 
        upcoming: [
          {
            id: 1,
            name: 'Test Booking',
            serviceProviderId: 1,
            timeSlot: '10:00 AM',
            date: '2025-01-01',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            start_time: '10:00',
            end_time: '12:00',
            bookingType: 'MONTHLY',
            monthlyAmount: 1000,
            paymentMode: 'CARD',
            address: 'Test Address',
            customerName: 'Test Customer',
            serviceProviderName: 'Test Provider',
            providerRating: 5,
            taskStatus: 'PENDING',
            bookingDate: '2025-01-01',
            service_type: 'maid',
            responsibilities: { tasks: [] },
            today_service: { status: 'PENDING' },
            payment: { status: 'PENDING' }
          }
        ],
        past: [],
        ongoing: [],
        cancelled: []
      } 
    });
  }),
}));

// Mock child components to avoid deep rendering issues
jest.mock('./ModifyBookingDialog', () => () => <div data-testid="modify-dialog" />);
jest.mock('./ConfirmationDialog', () => () => <div data-testid="confirmation-dialog" />);
jest.mock('./AddReviewDialog', () => () => <div data-testid="add-review-dialog" />);
jest.mock('./RaiseComplaintDialog', () => () => <div data-testid="raise-complaint-dialog" />);
jest.mock('./MyTicketsDialog', () => () => <div data-testid="my-tickets-dialog" />);
jest.mock('./Wallet', () => () => <div data-testid="wallet-dialog" />);
jest.mock('./VacationManagement', () => () => <div data-testid="vacation-dialog" />);
jest.mock('./OnDemandRebookDialog', () => () => <div data-testid="on-demand-rebook" />);
jest.mock('../ProviderDetails/MaidServiceDialog', () => () => <div data-testid="maid-dialog" />);
jest.mock('../ProviderDetails/CookServicesDialog', () => () => <div data-testid="cook-dialog" />);
jest.mock('../ProviderDetails/NannyServicesDialog', () => () => <div data-testid="nanny-dialog" />);
jest.mock('../ServicesDialog/ServicesDialog', () => () => <div data-testid="services-dialog" />);
jest.mock('./EngagementDetailsDrawer', () => () => <div data-testid="details-drawer" />);
jest.mock('./CustomerTodayTasksCard', () => () => <div data-testid="today-tasks-card" />);
jest.mock('../Tracking/TrackButton', () => () => <div data-testid="track-button" />);

describe('Bookings Component', () => {
  const theme = createTheme();
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth0 as jest.Mock).mockReturnValue({
      user: { sub: 'auth0|123' },
      isAuthenticated: true,
      getAccessTokenSilently: jest.fn(),
    });
    (useAppUser as jest.Mock).mockReturnValue({
      appUser: { customer_id: 1, phone_number: '1234567890' },
      authSessionReady: true,
    });
    
    store = configureStore({
      reducer: {
        geoLocation: () => ({ selectedLocation: null }),
        bookingType: () => ({ isBookingDialogOpen: false }),
      }
    });

    const axiosInstance = require('../../services/axiosInstance');
    axiosInstance.get.mockResolvedValue({
      data: {
        result: [
          {
            id: 1,
            name: 'Test Booking',
            serviceProviderId: 1,
            timeSlot: '10:00 AM',
            date: '2025-01-01',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            start_time: '10:00',
            end_time: '12:00',
            bookingType: 'MONTHLY',
            monthlyAmount: 1000,
            paymentMode: 'CARD',
            address: 'Test Address',
            customerName: 'Test Customer',
            serviceProviderName: 'Test Provider',
            providerRating: 5,
            taskStatus: 'PENDING',
            bookingDate: '2025-01-01',
            service_type: 'maid',
            responsibilities: { tasks: [] },
            today_service: { status: 'PENDING' },
            payment: { status: 'PENDING' }
          }
        ]
      }
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <Bookings handleDataFromChild={jest.fn()} />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    );
  };

  it('renders correctly and shows tabs', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Past').length).toBeGreaterThan(0);
    });
  });

  it('can click on different tabs', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0);
    });
    
    const upcomingTabs = screen.getAllByText('Upcoming');
    fireEvent.click(upcomingTabs[0]);
    
    const pastTabs = screen.getAllByText('Past');
    fireEvent.click(pastTabs[0]);
    
    const cancelledTabs = screen.getAllByText(/Cancel/);
    fireEvent.click(cancelledTabs[0]);
    
    const pendingTabs = screen.getAllByText(/Pending/);
    fireEvent.click(pendingTabs[0]);
  });

  it('can use the search input', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
    });
    
    const searchInputs = screen.getAllByPlaceholderText(/Search by booking/i);
    expect(searchInputs.length).toBeGreaterThan(0);
    
    fireEvent.change(searchInputs[0], { target: { value: 'Test Booking' } });
    
    // Check if the input value has changed
    expect(searchInputs[0]).toHaveValue('Test Booking');
  });

  it('can open details drawer', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0);
    });
    
    // Switch to Upcoming tab where bookings are rendered
    const upcomingTabs = screen.getAllByText('Upcoming');
    fireEvent.click(upcomingTabs[0]);
    
    // We mock the API to return no/empty items to just trigger state change
    const bookings = screen.queryAllByText(/Test Booking/);
    if (bookings.length > 0) {
      fireEvent.click(bookings[0]);
    }
  });

  it('can switch between all main tabs', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getAllByText('Past').length).toBeGreaterThan(0);
    });

    const tabs = ['Ongoing', 'Past', 'Cancelled', 'Pending payment'];
    tabs.forEach(tab => {
      const tabElements = screen.queryAllByText(new RegExp(tab, 'i'));
      if (tabElements.length > 0) {
        fireEvent.click(tabElements[0]);
      }
    });
  });

  it('can click Support and Wallet buttons', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /My support tickets/i })).toBeInTheDocument();
    });
    
    const supportBtn = screen.getByRole('button', { name: /My support tickets/i });
    fireEvent.click(supportBtn);
    
    const walletBtn = screen.getByRole('button', { name: /Open wallet/i });
    fireEvent.click(walletBtn);
  });

  it('processes deep link data from session storage', async () => {
    sessionStorage.setItem('deepLinkCustomerId', '1');
    sessionStorage.setItem('deepLinkBookingId', '1');
    sessionStorage.setItem('deepLinkTimestamp', Date.now().toString());
    sessionStorage.setItem('deepLinkAction', 'payment');
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
    });
    
    // Clear session storage to avoid side effects
    sessionStorage.clear();
  });

  it('can use upcoming filters', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0);
    });
    
    const upcomingTabs = screen.getAllByText('Upcoming');
    fireEvent.click(upcomingTabs[0]);
    
    // Test filter clicks safely
    const cookFilters = screen.queryAllByText('Cook');
    if (cookFilters.length > 0) fireEvent.click(cookFilters[0]);
    
    const maidFilters = screen.queryAllByText('Maid');
    if (maidFilters.length > 0) fireEvent.click(maidFilters[0]);

    const caregiverFilters = screen.queryAllByText('Caregiver');
    if (caregiverFilters.length > 0) fireEvent.click(caregiverFilters[0]);

    const monthlyFilters = screen.queryAllByText('Monthly');
    if (monthlyFilters.length > 0) fireEvent.click(monthlyFilters[0]);
  });
});
