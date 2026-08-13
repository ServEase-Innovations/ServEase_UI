import reducer, {
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  selectCartItemsByType,
} from './addToSlice';
import { CartState, CartItem } from '../../types/cartSlice';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('addToCart slice', () => {
  let initialState: CartState;

  beforeEach(() => {
    localStorageMock.clear();
    initialState = {
      items: [],
    };
  });

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle addToCart (new item)', () => {
      const mockItem: CartItem = {
        id: '1',
        type: 'maid',
        title: 'Basic Cleaning',
        price: 500,
        quantity: 1,
        // @ts-ignore - mock item
        details: { size: '2BHK' },
      };

      const actual = reducer(initialState, addToCart(mockItem));
      expect(actual.items.length).toEqual(1);
      expect(actual.items[0]).toEqual(mockItem);
      expect(JSON.parse(localStorage.getItem('unifiedCart') || '[]')).toEqual([mockItem]);
    });

    it('should handle addToCart (existing item update)', () => {
      const mockItem: CartItem = {
        id: '1',
        type: 'maid',
        title: 'Basic Cleaning',
        price: 500,
        quantity: 1,
        // @ts-ignore
        details: { size: '2BHK' },
      };

      const stateWithItem = reducer(initialState, addToCart(mockItem));
      
      const updateItem: CartItem = {
        ...mockItem,
        price: 600,
        quantity: 2,
      };

      const actual = reducer(stateWithItem, addToCart(updateItem));
      expect(actual.items.length).toEqual(1);
      expect(actual.items[0].price).toEqual(600);
      expect(actual.items[0].quantity).toEqual(2);
    });

    it('should handle removeFromCart by id', () => {
      const mockItem: any = { id: '1', type: 'meal', title: 'Meal', price: 100, quantity: 1 };
      const stateWithItem = { items: [mockItem] };

      const actual = reducer(stateWithItem, removeFromCart({ id: '1', type: 'meal' }));
      expect(actual.items.length).toEqual(0);
    });

    it('should handle removeFromCart by type', () => {
      const stateWithItems = {
        items: [
          { id: '1', type: 'meal', title: 'Meal 1', price: 100, quantity: 1 } as any,
          { id: '2', type: 'meal', title: 'Meal 2', price: 100, quantity: 1 } as any,
          { id: '3', type: 'maid', title: 'Maid', price: 500, quantity: 1 } as any,
        ],
      };

      const actual = reducer(stateWithItems, removeFromCart({ type: 'meal' }));
      expect(actual.items.length).toEqual(1);
      expect(actual.items[0].type).toEqual('maid');
    });

    it('should handle updateCartItem', () => {
      const stateWithItem = {
        items: [{ id: '1', type: 'maid', title: 'Maid', price: 500, quantity: 1 } as any],
      };

      const actual = reducer(
        stateWithItem,
        updateCartItem({ id: '1', type: 'maid', updates: { price: 600, quantity: 2 } })
      );

      expect(actual.items[0].price).toEqual(600);
      expect(actual.items[0].quantity).toEqual(2);
    });

    it('should handle clearCart', () => {
      const stateWithItems = {
        items: [{ id: '1', type: 'maid', title: 'Maid', price: 500, quantity: 1 } as any],
      };
      
      localStorageMock.setItem('unifiedCart', JSON.stringify(stateWithItems.items));
      const actual = reducer(stateWithItems, clearCart());

      expect(actual.items.length).toEqual(0);
      expect(localStorageMock.getItem('unifiedCart')).toBeNull();
    });
  });

  describe('selectors', () => {
    const mockState = {
      addToCart: {
        items: [
          { id: '1', type: 'meal', title: 'Meal 1', price: 100, quantity: 2 } as any,
          { id: '2', type: 'maid', title: 'Maid', price: 500, quantity: 1 } as any,
        ],
      },
    };

    it('selectCartItems should return items', () => {
      expect(selectCartItems(mockState)).toEqual(mockState.addToCart.items);
    });

    it('selectCartTotal should return correct total', () => {
      // 100 * 2 + 500 * 1 = 700
      expect(selectCartTotal(mockState)).toEqual(700);
    });

    it('selectCartItemCount should return count of unique items', () => {
      expect(selectCartItemCount(mockState)).toEqual(2);
    });

    it('selectCartItemsByType should filter by type', () => {
      expect(selectCartItemsByType('meal')(mockState).length).toEqual(1);
      expect(selectCartItemsByType('meal')(mockState)[0].id).toEqual('1');
    });
  });
});
