import { createSlice } from '@reduxjs/toolkit'
import { normalizeGeoLocationPayload } from 'src/utils/bookingLocation'

export const geoLocationSlice = createSlice({
  name: 'geoLocationData',
  initialState: {
    value: null as Record<string, unknown> | null,
    updatedAt: 0,
  },
  reducers: {
    add: (state , action) => {
      state.value = normalizeGeoLocationPayload(action.payload) ?? action.payload
      state.updatedAt = Date.now()
    },
    remove: (state) => {
      state.value = null
      state.updatedAt = Date.now()
    }
  },
})

// Action creators are generated for each case reducer function
export const { add, remove } = geoLocationSlice.actions

export default geoLocationSlice.reducer;