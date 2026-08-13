import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should debounce the function call', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    // Call multiple times
    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    // Fast-forward time, but not enough
    jest.advanceTimersByTime(50);
    expect(func).not.toHaveBeenCalled();

    // Fast-forward past wait time
    jest.advanceTimersByTime(50);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the debounced function', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc('test1', 123);
    debouncedFunc('test2', 456);

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
    expect(func).toHaveBeenCalledWith('test2', 456);
  });
});
