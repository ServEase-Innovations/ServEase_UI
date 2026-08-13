import userReducer, { add, remove } from './userSlice';

describe('userSlice', () => {
  const initialState = {
    value: null,
  };

  it('should handle initial state', () => {
    expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle add', () => {
    const user = { name: 'John Doe', email: 'john@example.com' };
    const actual = userReducer(initialState, add(user));
    expect(actual.value).toEqual(user);
  });

  it('should handle remove', () => {
    const loggedInState = {
      value: { name: 'John Doe', email: 'john@example.com' } as any,
    };
    const actual = userReducer(loggedInState, remove());
    expect(actual.value).toBeNull();
  });
});
