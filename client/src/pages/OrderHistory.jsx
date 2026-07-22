import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { ShoppingBag, Calendar, MapPin, Loader2, Sparkles, Phone, ShieldCheck, RefreshCcw, Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAppDispatch } from '../hooks/store';
import { addToCart } from '../features/cart/cartSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PizzaCanvas from '../components/pizza/PizzaCanvas';
import DeliveryMap from '../components/pizza/DeliveryMap';

export const OrderHistory = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to retrieve order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Sync statuses and toast alerts via active WebSockets
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';

    const socket = io(socketUrl, { withCredentials: true });

    socket.on('connect', () => {
      orders.forEach((order) => {
        if (order.status !== 'delivered') {
          socket.emit('joinOrder', order._id);
        }
      });
    });

    socket.on('orderStatusUpdated', (data) => {
      // 1. Trigger sliding Toast Alert message
      setToastMessage(`Your order is now: ${data.status}! 🍕`);
      setTimeout(() => setToastMessage(null), 4500);

      // 2. Sync React local order details state
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === data.orderId
            ? { ...o, status: data.status, paymentStatus: data.paymentStatus || o.paymentStatus }
            : o
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [orders.length]);

  const handleReorder = (order) => {
    // Re-hydrate all custom built pizzas from that order back into the Redux cart slice
    order.items.forEach((item) => {
      dispatch(
        addToCart({
          base: item.base,
          sauce: item.sauce,
          cheese: item.cheese,
          veggies: item.veggies,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })
      );
    });
    navigate('/cart');
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status mapping index for progress stepper
  const STAGES = ['received', 'in the kitchen', 'out for delivery', 'delivered'];
  const getStageIndex = (status) => STAGES.indexOf(status);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 min-h-[50vh] space-y-4 bg-[#faf8f5] rounded-3xl">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          className="w-12 h-12 border-4 border-dashed border-[#e23e20] rounded-full"
        />
        <p className="text-stone-500 font-extrabold text-xs animate-pulse">Loading past orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in min-h-screen bg-[#faf8f5] p-2 md:p-6 rounded-3xl text-[#1c1917] relative">
      
      {/* Dynamic Slide-In Status Change Toast alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1c1917] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 border border-stone-850"
          >
            <div className="bg-[#e23e20] p-1.5 rounded-xl">
              <Bell className="h-4 w-4 text-white animate-swing" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider">Order Status Update</h4>
              <p className="text-sm font-bold text-white mt-0.5">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-[#e23e20]" />
          <span>My Orders History</span>
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Track active kitchen preparation and view past pizza custom creations.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-[#e23e20] p-4 rounded-xl border border-red-100 text-xs">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-stone-200">
          <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-stone-850">No orders found</h3>
          <p className="text-stone-500 text-xs mt-1">
            You haven't ordered any custom gourmet pizzas yet!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStage = getStageIndex(order.status);
            const isExpanded = expandedOrderId === order._id;

            return (
              <div
                key={order._id}
                className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Order header card */}
                <div className="bg-stone-50/50 p-5 border-b border-stone-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <div>
                      <span className="font-bold text-stone-400 block uppercase">Order ID</span>
                      <span className="font-mono font-bold text-stone-700">{order._id}</span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-400 block uppercase">Placed On</span>
                      <span className="font-bold text-stone-700 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-stone-400" />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700 animate-pulse'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order content detail */}
                <div className="p-6 grid md:grid-cols-12 gap-8 items-start">
                  <div className="md:col-span-8 space-y-4 divide-y divide-stone-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className={`flex justify-between gap-4 ${idx > 0 ? 'pt-4' : ''}`}>
                        <div className="flex gap-4">
                          {/* Mini Pizza Canvas thumbnail preview */}
                          <div className="w-16 h-16 shrink-0 bg-stone-50 rounded-xl overflow-hidden flex items-center justify-center p-1 border border-stone-100">
                            <div className="w-12 h-12 scale-60 flex items-center justify-center">
                              <PizzaCanvas
                                size="small"
                                base={item.base}
                                sauce={item.sauce}
                                cheese={item.cheese}
                                veggies={item.veggies}
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-stone-850 capitalize text-sm">
                                {item.size} Custom Pizza
                              </h4>
                              <span className="text-stone-400 font-extrabold text-xs">
                                x{item.quantity}
                              </span>
                            </div>
                            <ul className="text-[10px] text-stone-500 flex flex-wrap gap-x-3 capitalize leading-normal mt-0.5">
                              <li>Base: {item.base?.name || 'Thin'}</li>
                              <li>Sauce: {item.sauce?.name || 'Classic'}</li>
                              <li>Cheese: {item.cheese?.name || 'Mozzarella'}</li>
                              {parseFloat((item.veggies || []).length) > 0 && (
                                <li>Toppings: {(item.veggies || []).map((v) => v?.name || '').join(', ')}</li>
                              )}
                            </ul>
                          </div>
                        </div>

                        <span className="font-extrabold text-stone-700 text-sm shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Logistics column */}
                  <div className="md:col-span-4 bg-stone-50/50 p-5 rounded-2xl border border-stone-150 space-y-4 text-xs text-stone-700">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-stone-450 uppercase">Total Amount</span>
                      <span className="text-lg font-black text-[#e23e20]">${order.totalAmount.toFixed(2)}</span>
                    </div>

                    <hr className="border-stone-200" />

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-stone-400" />
                        <span className="font-semibold">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-stone-400" />
                        <span className="font-semibold">{order.contactNumber}</span>
                      </div>
                    </div>

                    {/* Stepper expansion and reorder triggers */}
                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                        className="w-full bg-[#1c1917] hover:bg-stone-800 text-white font-bold py-2.5 rounded-xl transition-colors text-center"
                      >
                        {isExpanded ? 'Hide Live Map' : 'Track Active Delivery'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReorder(order)}
                        className="w-full bg-white hover:bg-stone-50 border border-stone-250 text-stone-700 font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        <span>One-Tap Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Animated Horizontal Stepper & Leaflet Map expansion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-stone-150 p-6 bg-[#faf8f5]/40 space-y-6"
                    >
                      {/* Active Stepper */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-stone-400 uppercase tracking-wider">Preparation Status</h4>
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                          {STAGES.map((label, idx) => {
                            const isCurrent = idx === currentStage;
                            const isDone = idx < currentStage;
                            return (
                              <div key={label} className="space-y-2">
                                <div
                                  className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold transition-all ${
                                    isCurrent
                                      ? 'bg-[#e23e20] text-white ring-4 ring-[#e23e20]/15 animate-pulse'
                                      : isDone
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-stone-150 text-stone-400'
                                  }`}
                                >
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <span
                                  className={`font-black uppercase tracking-wider block capitalize ${
                                    isCurrent ? 'text-[#e23e20]' : isDone ? 'text-emerald-600' : 'text-stone-450'
                                  }`}
                                >
                                  {label === 'in the kitchen' ? 'preparing' : label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Map component */}
                      <DeliveryMap order={order} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
