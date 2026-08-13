import pricingReducer, { add, remove } from './pricingSlice';

describe('pricingSlice', () => {
  const initialState = {
    value: [],
    groupedServices: {},
  };

  it('should handle initial state', () => {
    expect(pricingReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle add', () => {
    const payload = [
      { Service: 'Cook', price: 100 },
      { Service: 'Cook', price: 150 },
      { Service: 'Maid', price: 50 },
    ];
    const actual = pricingReducer(initialState, add(payload as any));
    
    // As per current implementation, it pushes the entire payload array into value
    expect(actual.value).toEqual([payload]);
    
    // Grouping logic
    expect(actual.groupedServices).toEqual({
      cook: [
        { Service: 'Cook', price: 100 },
        { Service: 'Cook', price: 150 },
      ],
      maid: [
        { Service: 'Maid', price: 50 },
      ],
    });
  });

  it('should handle remove', () => {
    const activeState = {
      value: [[{ Service: 'Cook', price: 100 }]],
      groupedServices: { cook: [{ Service: 'Cook', price: 100 }] },
    };
    const actual = pricingReducer(activeState as any, remove());
    expect(actual.value).toEqual([]);
    expect(actual.groupedServices).toEqual({});
  });
});
