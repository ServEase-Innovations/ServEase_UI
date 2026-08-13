import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Checkout from './Checkout';
import * as reactRedux from 'react-redux';
import { useAppUser } from 'src/context/AppUserContext';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('src/context/AppUserContext', () => ({
  useAppUser: jest.fn(),
}));

jest.mock('../Login/Login', () => ({ bookingPage }: { bookingPage: () => void }) => (
  <div data-testid="mock-login">
    Mock Login
    <button onClick={() => bookingPage()}>Close Login</button>
  </div>
));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid="shopping-cart-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}));

describe('Checkout Component', () => {
  const mockDispatch = jest.fn();
  const mockSendDataToParent = jest.fn();

  const defaultMockState = {
    cart: {
      value: {
        selecteditem: [
          {
            entry: { type: 'Cleaning' },
            price: 100
          }
        ],
        price: 100
      }
    },
    bookingType: { value: {} },
    user: { value: { customerDetails: { firstName: 'John', lastName: 'Doe' } } }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (reactRedux.useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
    
    // Default mock state
    (reactRedux.useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      return selectorFn(defaultMockState);
    });

    (useAppUser as jest.Mock).mockReturnValue({
      appUser: null,
    });
  });

  it('renders "No items selected" when cart is empty', () => {
    const emptyMockState = {
      cart: {
        value: {
          selecteditem: [],
          price: 0
        }
      },
      bookingType: { value: {} },
      user: { value: null }
    };

    (reactRedux.useSelector as unknown as jest.Mock).mockImplementation((selectorFn) => {
      return selectorFn(emptyMockState);
    });

    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    expect(screen.getByText('No items selected')).toBeInTheDocument();
  });

  it('renders checkout with cart items', () => {
    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    expect(screen.getByText('Selected Services')).toBeInTheDocument();
    expect(screen.getByText('COOK')).toBeInTheDocument();
    expect(screen.getByText('Grand Total: Rs. 100')).toBeInTheDocument();
  });

  it('shows Login button when not logged in', () => {
    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.queryByText('Checkout')).not.toBeInTheDocument();
  });

  it('shows Checkout button when logged in as CUSTOMER', () => {
    (useAppUser as jest.Mock).mockReturnValue({
      appUser: { role: 'CUSTOMER' },
    });

    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('opens login dialog when login is clicked', () => {
    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    const loginBtn = screen.getByText('Login');
    fireEvent.click(loginBtn);
    
    expect(screen.getByTestId('mock-login')).toBeInTheDocument();
  });

  it('closes login dialog when bookingPage callback is triggered', () => {
    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    // Open dialog
    fireEvent.click(screen.getByText('Login'));
    
    // Close dialog
    fireEvent.click(screen.getByRole('button', { name: 'Close Login' }));
    
  });

  it('updates persons quantity', () => {
    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]);
    
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('decreases persons quantity', () => {
    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    const plusButtons = screen.getAllByText('+');
    const minusButtons = screen.getAllByText('-');
    
    fireEvent.click(plusButtons[0]); // to 1
    fireEvent.click(plusButtons[0]); // to 2
    expect(screen.getByText('$100')).toBeInTheDocument();
    
    fireEvent.click(minusButtons[0]); // to 1
    expect(screen.getByText('$50')).toBeInTheDocument();
  });
  
  it('calls sendDataToParent when Back is clicked', () => {
    render(<Checkout providerDetails={{}} sendDataToParent={mockSendDataToParent} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    
    expect(mockSendDataToParent).toHaveBeenCalledWith('confirmation'); // assuming CONFIRMATION is 'confirmation'
  });
});
