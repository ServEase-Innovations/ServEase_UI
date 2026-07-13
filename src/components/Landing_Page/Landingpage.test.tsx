import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Landingpage } from './Landingpage';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ServiceProviderContext } from '../../context/ServiceProviderContext';

jest.mock('../Common/DialogComponent/DialogComponent', () => (props: any) => (
  props.open ? (
    <div data-testid="mock-dialog">
      Dialog
      <button onClick={props.onClose}>Close</button>
      <button onClick={props.onSave}>Save</button>
      {props.children}
    </div>
  ) : null
));

jest.mock('../ProviderDetails/CookServicesDialog', () => (props: any) => (
  props.open ? <div data-testid="mock-cook-dialog">Cook Dialog</div> : null
));
jest.mock('../ProviderDetails/MaidServiceDialog', () => (props: any) => (
  props.open ? <div data-testid="mock-maid-dialog">Maid Dialog</div> : null
));
jest.mock('../ProviderDetails/NannyServicesDialog', () => (props: any) => (
  props.open ? <div data-testid="mock-nanny-dialog">Nanny Dialog</div> : null
));
jest.mock('@mui/x-date-pickers/DateCalendar', () => ({
  DateCalendar: () => <div data-testid="mock-date-calendar">Date Calendar</div>,
}));

describe('Landingpage Component', () => {
  const mockSendDataToParent = jest.fn();
  const mockBookingType = jest.fn();
  const mockSetSelectedBookingType = jest.fn();

  beforeAll(() => {
    Object.defineProperty(window, 'Notification', {
      value: {
        permission: 'granted',
        requestPermission: jest.fn().mockResolvedValue('granted'),
      },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLandingpage = () => {
    const store = configureStore({
      reducer: {
        bookingType: (state = { value: {} }) => state,
      },
    });

    return render(
      <Provider store={store}>
        <ServiceProviderContext.Provider value={{
          selectedBookingType: '',
          setSelectedBookingType: mockSetSelectedBookingType,
          setBookingDetails: jest.fn(),
          serviceProviderId: null,
          setServiceProviderId: jest.fn(),
          setSearchQuery: jest.fn(),
          locationQuery: '',
          setLocationQuery: jest.fn(),
          latitude: null,
          setLatitude: jest.fn(),
          longitude: null,
          setLongitude: jest.fn(),
        } as any}>
          <Landingpage sendDataToParent={mockSendDataToParent} bookingType={mockBookingType} />
        </ServiceProviderContext.Provider>
      </Provider>
    );
  };

  it('renders correctly', () => {
    renderLandingpage();
    expect(screen.getByText('Cook')).toBeInTheDocument();
    expect(screen.getByText('Maid')).toBeInTheDocument();
    expect(screen.getByText('Nanny')).toBeInTheDocument();
  });

  it('opens dialog when a service is clicked', () => {
    renderLandingpage();
    
    const cookSelector = screen.getByText('Cook').previousSibling;
    if (cookSelector) {
      fireEvent.click(cookSelector);
      expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
      expect(mockSetSelectedBookingType).toHaveBeenCalledWith('cook');
    }
  });

  it('closes dialog when close is clicked', () => {
    renderLandingpage();
    
    const maidSelector = screen.getByText('Maid').previousSibling;
    if (maidSelector) {
      fireEvent.click(maidSelector);
      expect(screen.getByTestId('mock-dialog')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('mock-dialog')).not.toBeInTheDocument();
    }
  });

  it('shows radio buttons for booking preference inside dialog', () => {
    renderLandingpage();
    
    const nannySelector = screen.getByText('Nanny').previousSibling;
    if (nannySelector) {
      fireEvent.click(nannySelector);
      
      expect(screen.getByLabelText('Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Short term')).toBeInTheDocument();
      expect(screen.getByLabelText('Monthly')).toBeInTheDocument();
    }
  });

  it('calls sendDataToParent on save when short term is selected', () => {
    renderLandingpage();
    
    const cookSelector = screen.getByText('Cook').previousSibling;
    if (cookSelector) {
      fireEvent.click(cookSelector);
      
      const shortTermRadio = screen.getByLabelText('Short term');
      fireEvent.click(shortTermRadio);
      
      fireEvent.click(screen.getByText('Save'));
      
      // The DETAILS constant is returned from sendDataToParent
      expect(mockSendDataToParent).toHaveBeenCalled();
    }
  });
});
