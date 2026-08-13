import cartReducer, { add, remove } from './cartSlice';

describe('cartSlice', () => {
  const initialState = {
    value: null,
  };

  it('should handle initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle add', () => {
    const payload = { items: ['item1', 'item2'], total: 20 };
    const actual = cartReducer(initialState, add(payload));
    expect(actual.value).toEqual(payload);
  });

  it('should handle remove', () => {
    const activeState = {
      value: { items: ['item1'] } as any,
    };
    const actual = cartReducer(activeState, remove());
    expect(actual.value).toBeNull();
  });
});
