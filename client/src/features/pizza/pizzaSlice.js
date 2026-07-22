import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  options: [],
  loading: false,
  error: null,
};

export const fetchPizzaOptions = createAsyncThunk(
  'pizza/fetchOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/pizza/options');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to fetch options'
      );
    }
  }
);

const pizzaSlice = createSlice({
  name: 'pizza',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPizzaOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPizzaOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.options = action.payload;
      })
      .addCase(fetchPizzaOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default pizzaSlice.reducer;
