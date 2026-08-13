import bookingTypeReducer, {
  add,
  remove,
  update,
  commitSchedule,
  confirmProviderScheduleVerified,
  setScheduleDirty,
  setScheduleIncomplete,
  setScheduleDraft,
  openBookingDialog,
  closeBookingDialog,
} from './bookingTypeSlice';

describe('bookingTypeSlice', () => {
  const initialState = {
    value: null as Record<string, any> | null,
    scheduleRevision: 0,
    scheduleDirty: false,
    scheduleIncomplete: false,
    scheduleDraft: null,
    activeBookingDialogProviderId: null,
    verifiedProviderSchedule: null,
  };

  it('should handle initial state', () => {
    expect(bookingTypeReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle add', () => {
    const actual = bookingTypeReducer(initialState, add({ type: 'MAID' }));
    expect(actual.value).toEqual({ type: 'MAID' });
    expect(actual.scheduleRevision).toEqual(1);
  });

  it('should handle remove', () => {
    const activeState = {
      ...initialState,
      value: { type: 'MAID' },
      scheduleRevision: 5,
      scheduleDraft: { test: true },
      scheduleDirty: true,
      activeBookingDialogProviderId: '123'
    };
    const actual = bookingTypeReducer(activeState, remove());
    expect(actual.value).toBeNull();
    expect(actual.scheduleRevision).toEqual(6);
    expect(actual.scheduleDraft).toBeNull();
    expect(actual.scheduleDirty).toEqual(false);
    expect(actual.activeBookingDialogProviderId).toBeNull();
  });

  it('should handle update', () => {
    // When value is null
    let actual = bookingTypeReducer(initialState, update({ type: 'NANNY' }));
    expect(actual.value).toEqual({ type: 'NANNY' });

    // When value exists
    const stateWithValue = { ...initialState, value: { type: 'NANNY', hours: 4 } };
    actual = bookingTypeReducer(stateWithValue, update({ hours: 8, days: 2 }));
    expect(actual.value).toEqual({ type: 'NANNY', hours: 8, days: 2 });
  });

  it('should handle commitSchedule', () => {
    // When value is null
    let actual = bookingTypeReducer(initialState, commitSchedule({ type: 'COOK' }));
    expect(actual.value).toEqual({ type: 'COOK' });
    expect(actual.scheduleRevision).toEqual(1);
    expect(actual.scheduleDirty).toBe(false);
    expect(actual.scheduleIncomplete).toBe(false);

    // When value exists
    const activeState = {
      ...initialState,
      value: { type: 'COOK' },
      scheduleDirty: true,
      scheduleIncomplete: true,
      scheduleDraft: { temp: true },
      verifiedProviderSchedule: { providerId: '123', scheduleRevision: 0 }
    };
    actual = bookingTypeReducer(activeState, commitSchedule({ hours: 5 }));
    expect(actual.value).toEqual({ type: 'COOK', hours: 5 });
    expect(actual.scheduleRevision).toEqual(1);
    expect(actual.scheduleDirty).toBe(false);
    expect(actual.scheduleIncomplete).toBe(false);
    expect(actual.scheduleDraft).toBeNull();
    expect(actual.verifiedProviderSchedule).toBeNull();
  });

  it('should handle confirmProviderScheduleVerified', () => {
    const actual = bookingTypeReducer({ ...initialState, scheduleRevision: 3 }, confirmProviderScheduleVerified('provider-1'));
    expect(actual.verifiedProviderSchedule).toEqual({ providerId: 'provider-1', scheduleRevision: 3 });

    // Handle empty string
    const emptyActual = bookingTypeReducer(actual, confirmProviderScheduleVerified('  '));
    expect(emptyActual.verifiedProviderSchedule).toBeNull();
  });

  it('should handle setScheduleDirty', () => {
    const stateWithVerified = { ...initialState, verifiedProviderSchedule: { providerId: '1', scheduleRevision: 0 } };
    
    let actual = bookingTypeReducer(stateWithVerified, setScheduleDirty(true));
    expect(actual.scheduleDirty).toBe(true);
    expect(actual.verifiedProviderSchedule).toBeNull();

    actual = bookingTypeReducer(actual, setScheduleDirty(false));
    expect(actual.scheduleDirty).toBe(false);
    // Setting to false shouldn't restore verified schedule
    expect(actual.verifiedProviderSchedule).toBeNull();
  });

  it('should handle setScheduleIncomplete', () => {
    const actual = bookingTypeReducer(initialState, setScheduleIncomplete(true));
    expect(actual.scheduleIncomplete).toBe(true);
  });

  it('should handle setScheduleDraft', () => {
    const draft = { selectedDate: '2023-10-10' };
    let actual = bookingTypeReducer(initialState, setScheduleDraft(draft));
    expect(actual.scheduleDraft).toEqual(draft);

    actual = bookingTypeReducer(actual, setScheduleDraft(null));
    expect(actual.scheduleDraft).toBeNull();
  });

  it('should handle openBookingDialog and closeBookingDialog', () => {
    let actual = bookingTypeReducer(initialState, openBookingDialog('provider-xyz'));
    expect(actual.activeBookingDialogProviderId).toBe('provider-xyz');

    // Handle invalid id
    actual = bookingTypeReducer(actual, openBookingDialog('   '));
    expect(actual.activeBookingDialogProviderId).toBeNull();

    actual = bookingTypeReducer(actual, openBookingDialog('abc'));
    expect(actual.activeBookingDialogProviderId).toBe('abc');

    actual = bookingTypeReducer(actual, closeBookingDialog());
    expect(actual.activeBookingDialogProviderId).toBeNull();
  });
});
