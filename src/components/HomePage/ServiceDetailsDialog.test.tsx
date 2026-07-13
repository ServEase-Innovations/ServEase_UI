import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceDetailsDialog from './ServiceDetailsDialog';
import { useLanguage } from 'src/context/LanguageContext';
import { useTheme } from '@mui/material';

// Mock dependencies
jest.mock('src/context/LanguageContext', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
  useTheme: () => ({ breakpoints: { down: () => false } }),
}));

jest.mock('lucide-react', () => ({
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('ServiceDetailsDialog Component', () => {
  const mockOnClose = jest.fn();
  const mockOnBookNow = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLanguage as jest.Mock).mockReturnValue({
      t: (key: string) => key, // Return the key as the translation
    });
  });

  it('renders nothing when serviceType is null', () => {
    const { container } = render(<ServiceDetailsDialog open={true} onClose={mockOnClose} serviceType={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders maid service details correctly', () => {
    render(<ServiceDetailsDialog open={true} onClose={mockOnClose} serviceType="maid" />);
    
    expect(screen.getByText('maidServicesTitle')).toBeInTheDocument();
    expect(screen.getByText('maidServicesDescription')).toBeInTheDocument();
    expect(screen.getByText('cleaning')).toBeInTheDocument();
    expect(screen.getByText('utensilsCleaning')).toBeInTheDocument();
  });

  it('renders cook service details correctly', () => {
    render(<ServiceDetailsDialog open={true} onClose={mockOnClose} serviceType="cook" />);
    
    expect(screen.getByText('cookServicesTitle')).toBeInTheDocument();
    expect(screen.getByText('cookServicesDescription')).toBeInTheDocument();
  });

  it('renders babycare service details correctly', () => {
    render(<ServiceDetailsDialog open={true} onClose={mockOnClose} serviceType="babycare" />);
    
    expect(screen.getByText('caregiverServicesTitle')).toBeInTheDocument();
    expect(screen.getByText('caregiverServicesDescription')).toBeInTheDocument();
    // Check if the image renders for babycare
    expect(screen.getByAltText('caregiver')).toBeInTheDocument();
  });

  it('calls onClose when close icon is clicked', () => {
    render(<ServiceDetailsDialog open={true} onClose={mockOnClose} serviceType="maid" />);
    
    // There might be multiple elements with aria-label close, specifically the icon button
    fireEvent.click(screen.getByLabelText('close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button in actions is clicked', () => {
    render(<ServiceDetailsDialog open={true} onClose={mockOnClose} serviceType="maid" />);
    
    // The text 'close' is used for the button from t('close')
    // and also the aria label 'close' is used for the X button
    // Let's find the button by role and name
    const buttons = screen.getAllByRole('button', { name: /close/i });
    fireEvent.click(buttons[1]); // The second one should be the text button
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render book now button if onBookNow is not provided', () => {
    render(<ServiceDetailsDialog open={true} onClose={mockOnClose} serviceType="maid" />);
    
    expect(screen.queryByRole('button', { name: /bookNow/i })).not.toBeInTheDocument();
  });

  it('renders book now button and calls onBookNow when clicked', () => {
    render(<ServiceDetailsDialog open={true} onClose={mockOnClose} serviceType="maid" onBookNow={mockOnBookNow} />);
    
    const bookNowButton = screen.getByRole('button', { name: /bookNow/i });
    expect(bookNowButton).toBeInTheDocument();
    
    fireEvent.click(bookNowButton);
    expect(mockOnBookNow).toHaveBeenCalledTimes(1);
  });
});
