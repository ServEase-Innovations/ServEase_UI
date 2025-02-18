import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import cartReducer from '../features/cart/cartSlice';
import bookingTypeReducer from '../features/bookingType/bookingTypeSlice';
import pricingReducer from '../features/pricing/pricingSlice';

// Configure your Redux store
const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    bookingType: bookingTypeReducer,
    pricing: pricingReducer,
  },
});

// Define RootState type by inferring it directly from the store
export type RootState = ReturnType<typeof store.getState>;

// Export the store for use in the application
export default store;
