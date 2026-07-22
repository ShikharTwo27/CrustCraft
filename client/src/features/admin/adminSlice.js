import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { fetchPizzaOptions } from '../pizza/pizzaSlice';

const initialState = {
  inventory: [],
  orders: [],
  loading: false,
  error: null,
};

export const fetchInventory = createAsyncThunk(
  'admin/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/inventory');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to fetch inventory'
      );
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'admin/updateInventory',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/inventory/${id}`, data);
      dispatch(fetchInventory());
      dispatch(fetchPizzaOptions()); // Sync option list status
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update stock'
      );
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'admin/createInventory',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/inventory', data);
      dispatch(fetchInventory());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to create item'
      );
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'admin/deleteInventory',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      dispatch(fetchInventory());
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to delete item'
      );
    }
  }
);

export const updateOptionAvailability = createAsyncThunk(
  'admin/updateOptionAvailability',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/pizza/${id}`, data);
      dispatch(fetchPizzaOptions());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to update catalog option'
      );
    }
  }
);

export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchAdminOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/orders/admin/all');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to fetch admin orders'
      );
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to update order status'
      );
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
