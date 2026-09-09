import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/auth.js';

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('adhvaga_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser,
  token: localStorage.getItem('adhvaga_token') || null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    // Step 1 of 2FA: Verify credentials and send OTP (no token returned yet)
    return await authService.login(credentials);
  } catch (err) {
    return rejectWithValue(err.message || 'Login failed');
  }
});

export const verifyLoginOtp = createAsyncThunk('auth/verifyLoginOtp', async (payload, { rejectWithValue }) => {
  try {
    // Step 2 of 2FA: Verify OTP and get token
    return await authService.verifyLoginOtp(payload);
  } catch (err) {
    return rejectWithValue(err.message || 'OTP verification failed');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload);
  } catch (err) {
    return rejectWithValue(err.message || 'Registration failed');
  }
});

export const requestOtp = createAsyncThunk('auth/requestOtp', async (email, { rejectWithValue }) => {
  try {
    return await authService.requestOtp(email);
  } catch (err) {
    return rejectWithValue(err.message || 'Could not send OTP');
  }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (payload, { rejectWithValue }) => {
  try {
    return await authService.verifyOtp(payload);
  } catch (err) {
    return rejectWithValue(err.message || 'OTP verification failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      localStorage.removeItem('adhvaga_token');
      localStorage.removeItem('adhvaga_user');
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        // Step 1 of 2FA: Credentials verified, OTP sent. No token yet.
        state.status = 'idle';
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
      })
      .addCase(verifyLoginOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        // Step 2 of 2FA: OTP verified, token received
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('adhvaga_token', action.payload.token);
        localStorage.setItem('adhvaga_user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'OTP verification failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
        state.user = null;
        state.token = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Registration failed';
      })
      .addCase(requestOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Could not send OTP';
      })
      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('adhvaga_token', action.payload.token);
        localStorage.setItem('adhvaga_user', JSON.stringify(action.payload.user));
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'OTP verification failed';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
