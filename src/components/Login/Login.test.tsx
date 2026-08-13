import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import axiosInstance from '../../services/axiosInstance';
import { useDispatch } from 'react-redux';
import { useAppUser } from 'src/context/AppUserContext';
import { shouldResumeSpRegistration } from 'src/services/spRegistrationDraft';

// Mock dependencies
jest.mock('../../services/axiosInstance', () => ({
  post: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('src/context/AppUserContext', () => ({
  useAppUser: jest.fn(),
}));

jest.mock('src/services/spRegistrationDraft', () => ({
  shouldResumeSpRegistration: jest.fn(),
}));

jest.mock('../Registration/Registration', () => () => <div data-testid="mock-registration">Registration</div>);
jest.mock('../Registration/AgentRegistrationForm', () => () => <div data-testid="mock-agent-registration">AgentRegistration</div>);
jest.mock('../Registration/ServiceProviderRegistration', () => () => <div data-testid="mock-sp-registration">ServiceProviderRegistration</div>);
jest.mock('./ForgotPassword', () => () => <div data-testid="mock-forgot-password">ForgotPassword</div>);

describe('Login Component', () => {
  const mockDispatch = jest.fn();
  const mockSetAppUser = jest.fn();
  const mockSendDataToParent = jest.fn();
  const mockBookingPage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    (useAppUser as jest.Mock).mockReturnValue({
      appUser: null,
      setAppUser: mockSetAppUser,
    });
    (shouldResumeSpRegistration as jest.Mock).mockReturnValue(false);
  });

  it('renders mobile input form initially', () => {
    render(<Login sendDataToParent={mockSendDataToParent} bookingPage={mockBookingPage} />);
    
    expect(screen.getByText('Mobile OTP Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter 10-digit mobile number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SEND OTP/i })).toBeInTheDocument();
  });

  it('validates mobile number before sending OTP', async () => {
    render(<Login sendDataToParent={mockSendDataToParent} bookingPage={mockBookingPage} />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /SEND OTP/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit mobile number.')).toBeInTheDocument();
    });
    expect(axiosInstance.post).not.toHaveBeenCalled();
  });

  it('sends OTP successfully and displays OTP input', async () => {
    (axiosInstance.post as jest.Mock).mockResolvedValue({
      data: { data: { devOtp: '123456' } }
    });

    render(<Login sendDataToParent={mockSendDataToParent} bookingPage={mockBookingPage} />);
    
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button', { name: /SEND OTP/i }));
    
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/auth/otp/send', { mobile: '9876543210' });
      expect(screen.getByPlaceholderText('Enter 6-digit OTP')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /VERIFY OTP/i })).toBeInTheDocument();
      expect(screen.getByText(/OTP sent. Dev OTP: 123456/i)).toBeInTheDocument();
    });
  });

  it('handles OTP verification for CUSTOMER', async () => {
    jest.useFakeTimers();
    (axiosInstance.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { devOtp: '123456' } } }) // send OTP
      .mockResolvedValueOnce({ 
        data: { 
          data: { 
            role: 'CUSTOMER', 
            token: 'mock-token', 
            customerId: 1, 
            customer: { firstName: 'John', lastName: 'Doe', emailId: 'john@example.com' } 
          } 
        } 
      }); // verify OTP

    render(<Login sendDataToParent={mockSendDataToParent} bookingPage={mockBookingPage} />);
    
    // Send OTP
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button', { name: /SEND OTP/i }));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit OTP')).toBeInTheDocument();
    });

    // Verify OTP
    fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /VERIFY OTP/i }));

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/api/auth/otp/verify', { mobile: '9876543210', otp: '123456' });
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockSetAppUser).toHaveBeenCalledWith({
        role: 'CUSTOMER',
        customerid: 1,
        customerId: 1,
        token: 'mock-token',
        name: 'John Doe',
        email: 'john@example.com',
        mobileNo: '9876543210'
      });
      expect(screen.getByText('Login successful!')).toBeInTheDocument();
    });

    // Fast-forward timers for the setTimeout in navigation
    act(() => {
      jest.advanceTimersByTime(700);
    });

    expect(mockSendDataToParent).toHaveBeenCalledWith('');
    
    jest.useRealTimers();
  });
  
  it('resumes SP registration if appUser dictates it', () => {
    (shouldResumeSpRegistration as jest.Mock).mockReturnValue(true);
    
    render(<Login sendDataToParent={mockSendDataToParent} bookingPage={mockBookingPage} />);
    
    expect(screen.getByTestId('mock-sp-registration')).toBeInTheDocument();
  });
});
