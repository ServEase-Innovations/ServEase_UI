import { createSlice } from '@reduxjs/toolkit'

export const bookingTypeSlice = createSlice({
  name: 'bookingType',
  initialState: {
    value: null as Record<string, any> | null, // Ensure value is an object or null
  },
  reducers: {
    add: (state, action) => {
      state.value = action.payload;
    },
    remove: (state) => {
      state.value = null;
    },
    update: (state, action) => {
      if (!state.value) {
        state.value = action.payload;
      } else {
        Object.entries(action.payload).forEach(([key, value]) => {
          state.value![key] = value;
        });
      }
    }
    
    
  },
})

// Action creators
export const { add, remove, update } = bookingTypeSlice.actions;

export default bookingTypeSlice.reducer;
