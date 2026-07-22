import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const loadSavedItems = () => {
  try {
    const saved = localStorage.getItem('cartItems');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    // Only load items that are fully structured pizza builds
    return parsed.filter(item => item && item.base && item.sauce && item.cheese);
  } catch (err) {
    console.warn('Failed to parse saved cart items:', err);
    return [];
  }
};

const savedAddress = localStorage.getItem('deliveryAddress');
const savedPhone = localStorage.getItem('contactNumber');

const initialState = {
  items: loadSavedItems(),
  deliveryAddress: savedAddress || '',
  contactNumber: savedPhone || '',
  loading: false,
  error: null,
  success: false,
  lastCreatedOrder: null,
};

export const placeOrder = createAsyncThunk(
  'cart/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to place order'
      );
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'cart/verifyPayment',
  async (paymentData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/orders/verify-payment', paymentData);
      dispatch(clearCart());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Payment verification failed'
      );
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { base, sauce, cheese, veggies, size, quantity, price } = action.payload;

      // Create a unique hash signature for the custom pizza configuration
      const veggieIds = veggies.map(v => v._id).sort().join(',');
      const hash = `${base._id}-${sauce._id}-${cheese._id}-[${veggieIds}]-${size}`;

      const existingIndex = state.items.findIndex((item) => item.hash === hash);
      if (existingIndex > -1) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          hash,
          base,
          sauce,
          cheese,
          veggies,
          size,
          quantity,
          price,
        });
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.hash !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { hash, quantity } = action.payload;
      const index = state.items.findIndex((item) => item.hash === hash);
      if (index > -1) {
        state.items[index].quantity = Math.max(1, quantity);
      }
      localStorage.setItem('cartItems', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      state.success = false;
      state.error = null;
      localStorage.removeItem('cartItems');
    },
    resetSuccess: (state) => {
      state.success = false;
      state.lastCreatedOrder = null;
      state.error = null;
    },
    setContactInfo: (state, action) => {
      state.deliveryAddress = action.payload.deliveryAddress;
      state.contactNumber = action.payload.contactNumber;
      localStorage.setItem('deliveryAddress', action.payload.deliveryAddress);
      localStorage.setItem('contactNumber', action.payload.contactNumber);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = false; // Set to true only after payment is verified
        state.lastCreatedOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastCreatedOrder = action.payload;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, resetSuccess, setContactInfo } =
  cartSlice.actions;
export default cartSlice.reducer;
