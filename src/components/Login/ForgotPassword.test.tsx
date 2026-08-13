import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPassword from './ForgotPassword';
import axiosInstance from '../../services/axiosInstance';

jest.mock('../../services/axiosInstance', () => ({
  put: jest.fn(),
}));

describe('ForgotPassword', () => {
  const mockOnBackToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ForgotPassword onBackToLogin={mockOnBackToLogin} />);
    
    expect(screen.getByText('Update Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email\/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    expect(screen.getByText('Back to Login')).toBeInTheDocument();
  });

  it('shows error if fields are empty', async () => {
    render(<ForgotPassword onBackToLogin={mockOnBackToLogin} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    
    await waitFor(() => {
      expect(screen.getByText('Please fill out all fields.')).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    render(<ForgotPassword onBackToLogin={mockOnBackToLogin} />);
    
    const passwordInput = screen.getByLabelText(/New Password/i);
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    
    expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();

    fireEvent.change(passwordInput, { target: { value: 'longpasswordbutnodigits' } });
    expect(screen.getByText('Password must contain uppercase, lowercase, number, and special character.')).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    (axiosInstance.put as jest.Mock).mockResolvedValue({ status: 200 });

    render(<ForgotPassword onBackToLogin={mockOnBackToLogin} />);
    
    fireEvent.change(screen.getByLabelText(/Email\/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'StrongPass1!' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    
    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/api/user/update', {
        username: 'testuser',
        password: 'StrongPass1!',
      });
      expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
    });
  });

  it('shows error on failed submission', async () => {
    (axiosInstance.put as jest.Mock).mockRejectedValue(new Error('API error'));

    render(<ForgotPassword onBackToLogin={mockOnBackToLogin} />);
    
    fireEvent.change(screen.getByLabelText(/Email\/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'StrongPass1!' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Update' }));
    
    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again later.')).toBeInTheDocument();
    });
  });

  it('calls onBackToLogin', () => {
    render(<ForgotPassword onBackToLogin={mockOnBackToLogin} />);
    
    fireEvent.click(screen.getByText('Back to Login'));
    
    expect(mockOnBackToLogin).toHaveBeenCalledTimes(1);
  });
});
