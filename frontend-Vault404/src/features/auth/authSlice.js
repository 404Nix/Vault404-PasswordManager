import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import axios from 'axios';

// ─── Auth Thunks ───────────────────────────────────────────

// Attempt to restore session on app startup via refresh token cookie
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { rejectWithValue }) => {
    try {
      const baseURL = import.meta.env.VITE_API_URL;
      
      const { data } = await axios.get(`${baseURL}/auth/refresh-token`, {
        withCredentials: true,
      });
      // We got a new access token — now fetch user info
      const userRes = await axios.get(`${baseURL}/auth/get-me`, {
        headers: { Authorization: `Bearer ${data.accessToken}` },
        withCredentials: true,
      });
      return {
        accessToken: data.accessToken,
        user: userRes.data.user,
      };
    } catch (err) {
      return rejectWithValue('No active session');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data; // { message, user: { name, email, icon }, accessToken }
    } catch (err) {
      // Handle validation errors array
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        return rejectWithValue({ fieldErrors });
      }
      return rejectWithValue(
        err.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', formData);
      return data; // { message, user: { name, email, icon }, accessToken }
    } catch (err) {
      // Handle validation errors array
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        return rejectWithValue({ fieldErrors });
      }
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/get-me');
      return data; // { message, user: { name, email, icon } }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch user'
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/logout');
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Logout failed'
      );
    }
  }
);

export const logoutAllDevices = createAsyncThunk(
  'auth/logoutAllDevices',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/logout-all');
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Logout all failed'
      );
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.delete('/auth/delete-user');
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Account deletion failed'
      );
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      return data;
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        return rejectWithValue({ fieldErrors });
      }
      return rejectWithValue(
        err.response?.data?.message || 'Password update failed'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, email, currentPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.put('/auth/update-profile', { name, email, currentPassword });
      return data; // { message, user: { name, email, icon } }
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        return rejectWithValue({ fieldErrors });
      }
      return rejectWithValue(
        err.response?.data?.message || 'Profile update failed'
      );
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'auth/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/sessions');
      return data; // { sessions, count }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch sessions'
      );
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────

const initialState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  fieldErrors: null,
  authInitialized: false,
  sessions: [],
  sessionCount: 0,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Used by the Axios interceptor to inject a refreshed token
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
    // Used by the Axios interceptor when refresh fails
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
    },
    clearErrors(state) {
      state.error = null;
      state.fieldErrors = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Initialize Auth ──
      .addCase(initializeAuth.pending, (state) => {
        state.authInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.authInitialized = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.authInitialized = true;
        state.user = null;
        state.accessToken = null;
      })

      // ── Login ──
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.fieldErrors) {
          state.fieldErrors = action.payload.fieldErrors;
        } else {
          state.error = action.payload;
        }
      })

      // ── Signup ──
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.fieldErrors) {
          state.fieldErrors = action.payload.fieldErrors;
        } else {
          state.error = action.payload;
        }
      })

      // ── Get Me ──
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })

      // ── Logout ──
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      })

      // ── Logout All ──
      .addCase(logoutAllDevices.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      })

      // ── Delete Account ──
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
      })

      // ── Update Profile ──
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })

      // ── Fetch Sessions ──
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions = action.payload.sessions;
        state.sessionCount = action.payload.count;
      });
  },
});

export const { setAccessToken, clearAuth, clearErrors } = authSlice.actions;
export default authSlice.reducer;
