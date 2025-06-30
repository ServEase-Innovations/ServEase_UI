import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState, isMaidCartItem, isNannyCartItem, isMealCartItem } from '../../types/cartSlice';


// Helper to load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const savedCart = localStorage.getItem('unifiedCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage', error);
      return [];
    }
  }
  return [];
};

const initialState: CartState = {
  items: loadCartFromStorage(),
};

export const addToSlice = createSlice({
  name: 'addToCart',
  initialState,
  reducers: {
    // Add or update item in cart
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { type, id } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.id === id && item.type === type
      );

      if (existingIndex >= 0) {
        // Update existing item
        const existingItem = state.items[existingIndex];
        
        if (isMealCartItem(action.payload) && isMealCartItem(existingItem)) {
          state.items[existingIndex] = { ...existingItem, ...action.payload };
        } 
        else if (isMaidCartItem(action.payload) && isMaidCartItem(existingItem)) {
          state.items[existingIndex] = { ...existingItem, ...action.payload };
        }
        else if (isNannyCartItem(action.payload) && isNannyCartItem(existingItem)) {
          state.items[existingIndex] = { ...existingItem, ...action.payload };
        }
      } else {
        // Add new item
        state.items.push(action.payload);
      }

      localStorage.setItem('unifiedCart', JSON.stringify(state.items));
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<{ id: string; type: CartItem['type'] }>) => {
      state.items = state.items.filter(
        (item) => !(item.id === action.payload.id && item.type === action.payload.type)
      );
      localStorage.setItem('unifiedCart', JSON.stringify(state.items));
    },

    // Update specific fields of an item
    updateCartItem: (
      state,
      action: PayloadAction<{
        id: string;
        type: CartItem['type'];
        updates: Partial<CartItem>;
      }>
    ) => {
      const index = state.items.findIndex(
        (item) => item.id === action.payload.id && item.type === action.payload.type
      );

      if (index >= 0) {
        // Use Object.assign to properly handle Immer drafts
        Object.assign(state.items[index], action.payload.updates);
        localStorage.setItem('unifiedCart', JSON.stringify(state.items));
      }
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('unifiedCart');
    },
  },
});

export const { addToCart, removeFromCart, updateCartItem, clearCart } = addToSlice.actions;

// Selectors
export const selectCartItems = (state: { addToCart: CartState }) => state.addToCart.items;

export const selectCartTotal = (state: { addToCart: CartState }) =>
  state.addToCart.items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

export const selectCartItemCount = (state: { addToCart: CartState }) => state.addToCart.items.length;

export const selectCartItemsByType = (type: CartItem['type']) => 
  (state: { addToCart: CartState }) => state.addToCart.items.filter(item => item.type === type);

export default addToSlice.reducer;