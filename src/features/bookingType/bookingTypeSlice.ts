import { createSlice } from '@reduxjs/toolkit'

export const bookingTypeSlice = createSlice({
  name: 'bookingType',
  initialState: {
    value: null as Record<string, any> | null,
    /** Bumped when the user commits a schedule via Check availability. */
    scheduleRevision: 0,
    /** True while local date/time/duration edits are not yet committed. */
    scheduleDirty: false,
    /** True when the user edited the schedule but date/time is not yet complete locally. */
    scheduleIncomplete: false,
    /** In-progress schedule used for live price preview before commit. */
    scheduleDraft: null as Record<string, unknown> | null,
    /** Keeps the per-provider booking dialog open across list refreshes. */
    activeBookingDialogProviderId: null as string | null,
    /** Set when Check availability succeeds for the selected provider + committed schedule. */
    verifiedProviderSchedule: null as {
      providerId: string;
      scheduleRevision: number;
    } | null,
  },
  reducers: {
    add: (state, action) => {
      state.value = action.payload;
      state.scheduleRevision += 1;
    },
    remove: (state) => {
      state.value = null;
      state.scheduleRevision += 1;
      state.scheduleDraft = null;
      state.scheduleDirty = false;
      state.activeBookingDialogProviderId = null;
    },
    update: (state, action) => {
      if (!state.value) {
        state.value = action.payload;
      } else {
        Object.entries(action.payload).forEach(([key, value]) => {
          state.value![key] = value;
        });
      }
    },
    commitSchedule: (state, action) => {
      const patch = action.payload as Record<string, unknown>;
      if (!state.value) {
        state.value = patch;
      } else {
        Object.entries(patch).forEach(([key, value]) => {
          state.value![key] = value;
        });
      }
      state.scheduleRevision += 1;
      state.scheduleDirty = false;
      state.scheduleIncomplete = false;
      state.scheduleDraft = null;
      state.verifiedProviderSchedule = null;
    },
    confirmProviderScheduleVerified: (state, action) => {
      const providerId = String(action.payload ?? "").trim();
      if (!providerId) {
        state.verifiedProviderSchedule = null;
        return;
      }
      state.verifiedProviderSchedule = {
        providerId,
        scheduleRevision: state.scheduleRevision,
      };
    },
    setScheduleDirty: (state, action) => {
      state.scheduleDirty = Boolean(action.payload);
      if (state.scheduleDirty) {
        state.verifiedProviderSchedule = null;
      }
    },
    setScheduleIncomplete: (state, action) => {
      state.scheduleIncomplete = Boolean(action.payload);
    },
    setScheduleDraft: (state, action) => {
      state.scheduleDraft = action.payload ?? null;
    },
    openBookingDialog: (state, action) => {
      const id = action.payload;
      state.activeBookingDialogProviderId =
        id != null && String(id).trim() !== "" ? String(id) : null;
    },
    closeBookingDialog: (state) => {
      state.activeBookingDialogProviderId = null;
    },
  },
})

// Action creators
export const {
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
} = bookingTypeSlice.actions;

export default bookingTypeSlice.reducer;
