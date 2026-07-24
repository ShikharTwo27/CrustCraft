import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { updateQuantity, removeFromCart, placeOrder, resetSuccess, verifyPayment } from '../features/cart/cartSlice';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck, MapPin, Phone, AlertCircle, Loader2, Plus, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import PizzaCanvas from '../components/pizza/PizzaCanvas';

export const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, deliveryAddress, contactNumber, loading, error, success, lastCreatedOrder } =
    useAppSelector((state) => state.cart);

  const [address, setAddress] = useState(deliveryAddress || '');
  const [phone, setPhone] = useState(contactNumber || '');
  const [localValidationError, setLocalValidationError] = useState('');
  const [paying, setPaying] = useState(false);

  // Hardcoded upsell side items
  const UPSELL_ITEMS = [
    { id: 'garlic_bread', name: 'Garlic Breadsticks', price: 399, image: '🥖', desc: 'Freshly baked garlic butter rods' },
    { id: 'lava_cake', name: 'Choco Lava Cake', price: 319, image: '🧁', desc: 'Warm chocolate fudge center' },
    { id: 'coke', name: 'Mexican Coca-Cola', price: 180, image: '🥤', desc: 'Real cane sugar classic soda' },
  ];

  useEffect(() => {
    // Reset success flags on mount so customer doesn't see old completions
    dispatch(resetSuccess());
    setLocalValidationError('');
  }, [dispatch]);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();

  const handlePaymentInitiation = async (order) => {
    try {
      setPaying(true);
      setLocalValidationError('');

      // 1. Fetch Razorpay order details from backend
      const response = await api.post(`/orders/${order._id}/pay`);
      const rzpOrder = response.data.data;

      // 2. Mock payment mode fallback
      if (rzpOrder.isMock) {
        setTimeout(async () => {
          await dispatch(
            verifyPayment({
              orderId: order._id,
              razorpayOrderId: rzpOrder.id,
              razorpayPaymentId: 'pay_mock_development',
              razorpaySignature: 'mock_signature',
            })
          );
          setPaying(false);
        }, 1500);
        return;
      }

      // 3. Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'placeholder_key_id',
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'CrustCraft',
        description: 'Verify pizza inventory lock',
        order_id: rzpOrder.id,
        handler: async (paymentResponse) => {
          setPaying(true);
          await dispatch(
            verifyPayment({
              orderId: order._id,
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            })
          );
          setPaying(false);
        },
        prefill: {
          name: 'Customer',
        },
        theme: {
          color: '#e23e20', // Styled to match warm tomato red
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setLocalValidationError(`Payment failed: ${resp.error.description}`);
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setLocalValidationError(err.response?.data?.error || 'Failed to initiate gateway payment.');
      setPaying(false);
    }
  };

  const handleDevBypassCheckout = async (e) => {
    e.preventDefault();
    setLocalValidationError('');

    if (items.length === 0) {
      setLocalValidationError('Your shopping cart is empty.');
      return;
    }

    if (!address.trim() || address.length < 5) {
      setLocalValidationError('Please enter a valid delivery address (min 5 chars).');
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setLocalValidationError('Please enter a valid contact phone number (min 10 chars).');
      return;
    }

    setPaying(true);
    try {
      const payload = {
        items: items.map((item) => {
          if (item.isSide) {
            return {
              isSide: true,
              sideId: item.sideId,
              quantity: item.quantity,
            };
          }
          return {
            base: item.base._id,
            customName: `${item.size} Customized Pizza`,
            sauce: item.sauce._id,
            cheese: item.cheese._id,
            veggies: item.veggies.map((v) => v._id),
            size: item.size,
            quantity: item.quantity,
          };
        }),
        deliveryAddress: address,
        contactNumber: phone,
      };

      const resultAction = await dispatch(placeOrder(payload));
      if (placeOrder.fulfilled.match(resultAction)) {
        const order = resultAction.payload;
        // Direct verification check with mock order bypass prefix
        const payConfirm = await dispatch(
          verifyPayment({
            orderId: order._id,
            razorpayOrderId: `mock_rzp_order_${order._id}`,
            razorpayPaymentId: 'pay_mock_development',
            razorpaySignature: 'mock_signature',
          })
        );
        if (verifyPayment.fulfilled.match(payConfirm)) {
          // Success handled in slice
        } else {
          setLocalValidationError(payConfirm.payload || 'Bypass payment confirmation failed.');
        }
      }
    } catch (err) {
      setLocalValidationError('Bypass checkout process failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLocalValidationError('');

    if (items.length === 0) {
      setLocalValidationError('Your shopping cart is empty.');
      return;
    }

    if (!address.trim() || address.length < 5) {
      setLocalValidationError('Please enter a valid delivery address (min 5 chars).');
      return;
    }

    if (!phone.trim() || phone.length < 10) {
      setLocalValidationError('Please enter a valid contact phone number (min 10 chars).');
      return;
    }

    const payload = {
      items: items.map((item) => {
        if (item.isSide) {
          return {
            isSide: true,
            sideId: item.sideId,
            quantity: item.quantity,
          };
        }
        return {
          base: item.base._id,
          customName: `${item.size} Customized Pizza`,
          sauce: item.sauce._id,
          cheese: item.cheese._id,
          veggies: item.veggies.map((v) => v._id),
          size: item.size,
          quantity: item.quantity,
        };
      }),
      deliveryAddress: address,
      contactNumber: phone,
    };

    const resultAction = await dispatch(placeOrder(payload));
    if (placeOrder.fulfilled.match(resultAction)) {
      const order = resultAction.payload;
      await handlePaymentInitiation(order);
    }
  };

  if (success && lastCreatedOrder) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center px-4 animate-fade-in bg-[#faf8f5] rounded-3xl">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full space-y-6">
          <div className="bg-green-50 text-green-600 p-4 rounded-full w-fit mx-auto animate-bounce">
            <ShieldCheck className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900">Order Placed!</h1>
          <p className="text-stone-600 font-medium">
            Your inventory reservation of ₹{lastCreatedOrder.totalAmount.toFixed(2)} is locked.
          </p>
          <div className="bg-stone-50 p-4 rounded-xl text-left border border-stone-200 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500 font-semibold">Order ID:</span>
              <span className="font-bold text-stone-900 font-mono text-xs">{lastCreatedOrder._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-semibold">Status:</span>
              <span className="font-bold text-amber-600 capitalize">{lastCreatedOrder.status}</span>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                dispatch(resetSuccess());
                navigate('/orders');
              }}
              className="bg-stone-900 hover:bg-stone-850 text-white font-bold py-3 rounded-xl transition-all"
            >
              View My Orders
            </button>
            <Link
              to="/builder"
              onClick={() => dispatch(resetSuccess())}
              className="text-stone-600 hover:text-[#e23e20] font-semibold text-sm transition-colors"
            >
              Build another pizza
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in min-h-screen bg-[#faf8f5] p-2 md:p-6 rounded-3xl text-[#1c1917]">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-[#e23e20]" />
          <span>My Shopping Cart</span>
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Review your custom canvas builds and lock your ingredient inventory.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-stone-200 p-8">
          <ShoppingBag className="h-16 w-16 text-stone-300 mb-4" />
          <h3 className="text-lg font-black text-stone-800">Your cart is empty</h3>
          <p className="text-stone-500 text-xs max-w-sm mt-1 mb-6">
            Head back to the Pizza Builder Studio to craft your unique inventory-linked pizza.
          </p>
          <Link
            to="/builder"
            className="bg-[#e23e20] hover:bg-[#c22e17] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md"
          >
            Go to Builder
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Cart items list */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.hash}
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 20 }}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row overflow-hidden relative"
                  >
                    {/* Visual Pizza SVG Thumbnail or Side emoji */}
                    <div className="bg-stone-50/50 w-full sm:w-36 h-36 flex items-center justify-center p-2 shrink-0 border-r border-stone-100">
                      <div className="w-24 h-24 scale-75 sm:scale-90 flex items-center justify-center">
                        {item.isSide ? (
                          <span className="text-5xl">
                            {item.sideId === 'garlic_bread' ? '🥖' : item.sideId === 'lava_cake' ? '🧁' : '🥤'}
                          </span>
                        ) : (
                          <PizzaCanvas
                            size="small"
                            base={item.base}
                            sauce={item.sauce}
                            cheese={item.cheese}
                            veggies={item.veggies}
                          />
                        )}
                      </div>
                    </div>

                    {/* Details Column */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-extrabold capitalize text-stone-900">
                              {item.isSide ? item.sideName : `${item.size} Custom Pizza`}
                            </span>
                            {!item.isSide && (
                              <span className="bg-orange-50 text-[#e23e20] text-[9px] font-black px-2 py-0.5 rounded capitalize">
                                {item.base?.name || 'Regular Crust'}
                              </span>
                            )}
                          </div>
                          {item.isSide ? (
                            <p className="text-[11px] text-stone-500 mt-2 font-semibold">
                              Freshly prepared side addition.
                            </p>
                          ) : (
                            <ul className="text-[10px] text-stone-500 space-y-0.5 list-disc pl-4 capitalize mt-2">
                              <li>Sauce: {item.sauce?.name || 'Classic'}</li>
                              <li>Cheese: {item.cheese?.name || 'Mozzarella'}</li>
                              {parseFloat((item.veggies || []).length) > 0 && (
                                <li>Toppings: {(item.veggies || []).map((v) => v?.name || '').join(', ')}</li>
                              )}
                            </ul>
                          )}
                        </div>

                        {/* Trash Action */}
                        <button
                          type="button"
                          onClick={() => dispatch(removeFromCart(item.hash))}
                          className="text-stone-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-stone-50 transition-colors shrink-0"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-2 border-t border-dashed border-stone-100">
                        <span className="text-sm font-black text-[#e23e20]">
                          ₹{item.price.toFixed(2)} each
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 px-2 py-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(updateQuantity({ hash: item.hash, quantity: item.quantity - 1 }))
                            }
                            className="text-stone-550 hover:text-stone-850 px-2 font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-stone-850 px-2 text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(updateQuantity({ hash: item.hash, quantity: item.quantity + 1 }))
                            }
                            className="text-stone-550 hover:text-stone-850 px-2 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Back Link */}
            <Link
              to="/builder"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-[#e23e20] hover:text-[#c22e17] transition-colors pt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Builder Studio</span>
            </Link>

            {/* Static "You might also like" Upsell Ribbon */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-[#e23e20]" />
                <h4 className="text-sm font-black text-stone-900">Complete Your Meal</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {UPSELL_ITEMS.map((item) => (
                  <div key={item.id} className="border border-stone-100 rounded-2xl p-4 flex sm:flex-col justify-between items-center sm:text-center bg-[#faf8f5]/50 hover:bg-white hover:shadow-sm transition-all gap-4">
                    <span className="text-3xl sm:mb-2">{item.image}</span>
                    <div className="flex-grow sm:flex-grow-0">
                      <h5 className="text-xs font-black text-stone-850">{item.name}</h5>
                      <span className="text-[10px] text-stone-400 block mt-0.5">{item.desc}</span>
                      <span className="text-xs font-black text-[#e23e20] block mt-1">₹{item.price}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => dispatch(addToCart({ isSide: true, sideId: item.id, name: item.name, price: item.price, quantity: 1 }))}
                      className="p-2 bg-white hover:bg-orange-50 hover:text-[#e23e20] border border-stone-200 rounded-xl text-stone-500 transition-colors shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Details (Right Side) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-6 sticky top-24">
            <h3 className="text-lg font-black text-stone-900 border-b border-stone-150 pb-4">
              Checkout & Delivery Address
            </h3>

            {/* Validation errors alerts */}
            {localValidationError && (
              <div className="bg-red-50 text-[#e23e20] p-4 rounded-xl border border-red-100 text-xs flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{localValidationError}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 text-[#e23e20] p-4 rounded-xl border border-red-100 text-xs flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Confirming payment animated overlay */}
            {paying && (
              <div className="bg-orange-50/90 text-[#e23e20] p-6 rounded-xl border border-orange-100 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#e23e20]" />
                <div className="text-center">
                  <h4 className="font-black text-sm">Locking Ingredients...</h4>
                  <p className="text-[10px] text-stone-500 mt-1">Verifying secure signature with Razorpay gateway.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                  <textarea
                    rows="3"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e23e20]/20 text-xs text-stone-700 bg-stone-50"
                    placeholder="Enter full delivery coordinates (e.g. 104 Palace Rd, Amreli, Gujarat)"
                    required
                    disabled={paying || loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e23e20]/20 text-xs text-stone-700 bg-stone-50"
                    placeholder="Enter 10-digit mobile number"
                    required
                    disabled={paying || loading}
                  />
                </div>
              </div>

              <div className="border-t border-dashed border-stone-200 pt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-stone-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-stone-500">
                  <span>Delivery Charge</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 border-t border-stone-100 pt-2">
                  <span>Grand Total</span>
                  <span className="text-base text-[#e23e20]">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || paying || items.length === 0}
                className="w-full py-4 bg-[#e23e20] hover:bg-[#c22e17] text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
              >
                {loading || paying ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <span>Place Reservation Order</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleDevBypassCheckout}
                disabled={loading || paying || items.length === 0}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl border border-stone-300 transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-xs mt-2"
              >
                <span>⚡ Dev Option: Bypass Razorpay (Simulate Paid)</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
