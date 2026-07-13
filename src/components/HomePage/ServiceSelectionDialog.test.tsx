import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceSelectionDialog from './ServiceSelectionDialog';
import { FIRST_BOOKING_COUPON_CODES } from 'src/services/couponService';

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

jest.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('ServiceSelectionDialog Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectService = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<ServiceSelectionDialog open={true} onClose={mockOnClose} onSelectService={mockOnSelectService} />);
    
    expect(screen.getByText('Select service')).toBeInTheDocument();
    expect(screen.getByText('Home Cook')).toBeInTheDocument();
    expect(screen.getByText('Cleaning Help')).toBeInTheDocument();
    expect(screen.getByText('Caregiver')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ServiceSelectionDialog open={false} onClose={mockOnClose} onSelectService={mockOnSelectService} />);
    
    expect(screen.queryByText('Select service')).not.toBeInTheDocument();
  });

  it('calls onClose when close icon is clicked', () => {
    render(<ServiceSelectionDialog open={true} onClose={mockOnClose} onSelectService={mockOnSelectService} />);
    
    fireEvent.click(screen.getByLabelText('Close'));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectService and onClose when a service is clicked', () => {
    render(<ServiceSelectionDialog open={true} onClose={mockOnClose} onSelectService={mockOnSelectService} />);
    
    fireEvent.click(screen.getByText('Home Cook'));
    
    expect(mockOnSelectService).toHaveBeenCalledWith('COOK');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('copies coupon code when copy button is clicked', async () => {
    render(<ServiceSelectionDialog open={true} onClose={mockOnClose} onSelectService={mockOnSelectService} />);
    
    // Find the button containing the maid coupon text
    const maidButton = screen.getByText(new RegExp(`Maid: ${FIRST_BOOKING_COUPON_CODES.MAID}`));
    fireEvent.click(maidButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FIRST_BOOKING_COUPON_CODES.MAID);
    
    await waitFor(() => {
      expect(screen.getByText(`Coupon "${FIRST_BOOKING_COUPON_CODES.MAID}" copied!`)).toBeInTheDocument();
    });
  });
});
