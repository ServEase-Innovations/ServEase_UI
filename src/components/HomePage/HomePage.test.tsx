import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './HomePage';
import { useAuth0 } from '@auth0/auth0-react';
import { useAppUser } from 'src/context/AppUserContext';
import { useLanguage } from 'src/context/LanguageContext';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock all external dependencies
jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('src/context/AppUserContext', () => ({
  useAppUser: jest.fn(),
}));

jest.mock('src/context/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('src/services/spRegistrationDraft', () => ({
  shouldResumeSpRegistration: jest.fn().mockReturnValue(false),
}));

jest.mock('src/utils/spSession', () => ({
  resolveProviderIdNumber: jest.fn().mockReturnValue(null),
}));

jest.mock('../hooks/useFirstBookingOfferVisible', () => ({
  useFirstBookingOfferVisible: () => ({ showOffer: false, checking: false }),
}));

// Mock child components to simplify testing
jest.mock('../BookingDialog/BookingDialog', () => (props: any) => (
  props.open ? <div data-testid="mock-booking-dialog">Booking Dialog</div> : null
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
jest.mock('./ServiceDetailsDialog', () => (props: any) => (
  props.open ? <div data-testid="mock-service-details-dialog">Service Details Dialog</div> : null
));
jest.mock('../Registration/ServiceProviderRegistration', () => () => <div data-testid="mock-sp-registration">SP Registration</div>);
jest.mock('../Chat/Chatbot', () => () => <div data-testid="mock-chatbot">Chatbot</div>);
jest.mock('../Registration/AgentRegistrationForm', () => () => <div data-testid="mock-agent-registration">Agent Registration</div>);

describe('HomePage Component', () => {
  const mockSendDataToParent = jest.fn();
  const mockBookingType = jest.fn();
  const mockOnAboutClick = jest.fn();
  const mockOnContactClick = jest.fn();
  const mockLoginWithPopup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useAuth0 as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loginWithPopup: mockLoginWithPopup.mockResolvedValue(undefined),
    });

    (useAppUser as jest.Mock).mockReturnValue({
      appUser: null,
    });

    (useLanguage as jest.Mock).mockReturnValue({
      t: (key: string) => key,
      currentLanguage: 'en',
    });
  });

  const renderHomePage = () => {
    const store = configureStore({
      reducer: {
        bookingType: (state = { value: {} }) => state,
      },
    });

    return render(
      <Provider store={store}>
        <HomePage 
          sendDataToParent={mockSendDataToParent} 
          bookingType={mockBookingType} 
          onAboutClick={mockOnAboutClick} 
          onContactClick={mockOnContactClick}
        />
      </Provider>
    );
  };

  it('renders hero section and services', () => {
    renderHomePage();
    
    expect(screen.getByText('heroTitle')).toBeInTheDocument();
    expect(screen.getByText('heroDescription')).toBeInTheDocument();
    
    // Services buttons
    const serviceButtons = screen.getAllByRole('button', { name: /bookService/i });
    expect(serviceButtons.length).toBe(3);
  });

  it('shows registration buttons when not logged in', () => {
    renderHomePage();
    
    expect(screen.getByText('registerAsUser')).toBeInTheDocument();
    expect(screen.getByText('registerAsProvider')).toBeInTheDocument();
    expect(screen.getByText('registerAsAgent')).toBeInTheDocument();
  });

  it('calls loginWithPopup when Register as User is clicked', () => {
    renderHomePage();
    
    fireEvent.click(screen.getByText('registerAsUser'));
    expect(mockLoginWithPopup).toHaveBeenCalledWith({ authorizationParams: { screen_hint: 'signup' } });
  });

  it('opens AgentRegistrationForm when Register as Agent is clicked', () => {
    renderHomePage();
    
    fireEvent.click(screen.getByText('registerAsAgent'));
    expect(screen.getByTestId('mock-agent-registration')).toBeInTheDocument();
  });

  it('opens ServiceProviderRegistration when Register as Provider is clicked', () => {
    renderHomePage();
    
    fireEvent.click(screen.getByText('registerAsProvider'));
    expect(screen.getByTestId('mock-sp-registration')).toBeInTheDocument();
  });

  it('opens booking dialog when a service is clicked', () => {
    renderHomePage();
    
    // Find the first service button (Cook)
    const cookButton = screen.getByRole('button', { name: /homeCook — bookService/i });
    fireEvent.click(cookButton);
    
    expect(screen.getByTestId('mock-booking-dialog')).toBeInTheDocument();
  });

  it('opens service details dialog when learn more is clicked', () => {
    renderHomePage();
    
    const learnMoreButtons = screen.getAllByRole('button', { name: /learnMore/i });
    fireEvent.click(learnMoreButtons[0]);
    
    expect(screen.getByTestId('mock-service-details-dialog')).toBeInTheDocument();
  });
});
