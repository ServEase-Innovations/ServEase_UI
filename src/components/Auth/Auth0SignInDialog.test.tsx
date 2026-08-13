import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Auth0SignInDialog from './Auth0SignInDialog';
import { useAuth0 } from '@auth0/auth0-react';
import { useLanguage } from 'src/context/LanguageContext';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: jest.fn(),
}));

jest.mock('src/context/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

describe('Auth0SignInDialog', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLanguage as jest.Mock).mockReturnValue({
      t: (key: string) => key,
    });
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });
  });

  it('renders correctly when open', () => {
    render(<Auth0SignInDialog open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('auth0SigningInTitle')).toBeInTheDocument();
    expect(screen.getByText('auth0CompleteInPopupWindow')).toBeInTheDocument();
    expect(screen.getByText('auth0SignInNote')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<Auth0SignInDialog open={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('auth0SigningInTitle')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<Auth0SignInDialog open={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when authentication completes while open', () => {
    const { rerender } = render(<Auth0SignInDialog open={true} onClose={mockOnClose} />);
    
    // Simulate auth state change
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });
    
    rerender(<Auth0SignInDialog open={true} onClose={mockOnClose} />);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose if already authenticated on open', () => {
    (useAuth0 as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });
    
    const { rerender } = render(<Auth0SignInDialog open={true} onClose={mockOnClose} />);
    
    // Simulate a re-render
    rerender(<Auth0SignInDialog open={true} onClose={mockOnClose} />);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
