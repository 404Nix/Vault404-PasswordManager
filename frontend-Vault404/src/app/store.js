import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import vaultReducer from '../features/vault/vaultSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vault: vaultReducer,
    ui: uiReducer,
  },
});
