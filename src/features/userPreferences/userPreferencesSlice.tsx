import { createSlice } from '@reduxjs/toolkit'

export const userPreferenceSlice = createSlice({
  name: 'userPreference',
  initialState: {
    value: null,
  },
  reducers: {
    addPreferences: (state , action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      state.value = action.payload
    },
    removePreferences: (state) => {
      state.value = null
    }
  },
})

// Action creators are generated for each case reducer function
export const { addPreferences, removePreferences } = userPreferenceSlice.actions

export default userPreferenceSlice.reducer;