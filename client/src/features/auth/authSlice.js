import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

const getErrorMessage = (error, defaultMsg) => {
  if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
    return error.response.data.details.map((d) => d.message).join(', ');
  }
  return error.response?.data?.error || error.response?.data?.message || defaultMsg;
};

// Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Registration failed'));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, refreshToken, user } = response.data.data;
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      return user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Login failed'));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Proceed with local logout even if request fails
    } finally {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
  }
);

export const checkMe = createAsyncThunk(
  'auth/checkMe',
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) throw new Error('No access token in storage');
      
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      return rejectWithValue(
        error.response?.data?.error || 'Session check failed'
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Verification failed'));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Failed to send request'));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Reset failed'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    localLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });

    // CheckMe
    builder
      .addCase(checkMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(checkMe.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      });
  },
});

export const { clearError, localLogout } = authSlice.actions;
export default authSlice.reducer;
