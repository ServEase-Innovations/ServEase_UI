import detailsDataReducer, { add, remove } from './detailsDataSlice';

describe('detailsDataSlice', () => {
  const initialState = {
    value: null,
  };

  it('should handle initial state', () => {
    expect(detailsDataReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle add', () => {
    const payload = { providerId: 'provider123', name: 'Super Maids' };
    const actual = detailsDataReducer(initialState, add(payload));
    expect(actual.value).toEqual(payload);
  });

  it('should handle remove', () => {
    const activeState = {
      value: { providerId: 'provider123' } as any,
    };
    const actual = detailsDataReducer(activeState, remove());
    expect(actual.value).toBeNull();
  });
});
