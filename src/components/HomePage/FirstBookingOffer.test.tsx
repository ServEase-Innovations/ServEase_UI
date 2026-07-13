import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FirstBookingOffer from './FirstBookingOffer';
import { FIRST_BOOKING_COUPON_CODES } from 'src/services/couponService';

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
}));

describe('FirstBookingOffer Component', () => {
  it('renders correctly', () => {
    const mockOnPress = jest.fn();
    render(<FirstBookingOffer onPress={mockOnPress} />);
    
    expect(screen.getByText('First booking')).toBeInTheDocument();
    expect(screen.getByText('₹99')).toBeInTheDocument();
    expect(screen.getByText(FIRST_BOOKING_COUPON_CODES.MAID)).toBeInTheDocument();
    expect(screen.getByText(FIRST_BOOKING_COUPON_CODES.COOK)).toBeInTheDocument();
    expect(screen.getByText(/T&C apply/i)).toBeInTheDocument();
  });

  it('calls onPress when clicked', () => {
    const mockOnPress = jest.fn();
    render(<FirstBookingOffer onPress={mockOnPress} />);
    
    // We can query by role since it's a button
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
