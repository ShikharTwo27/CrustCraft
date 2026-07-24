import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/store';
import { fetchPizzaOptions } from '../features/pizza/pizzaSlice';
import { addToCart } from '../features/cart/cartSlice';
import { ShoppingCart, Sparkles, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PizzaCanvas from '../components/pizza/PizzaCanvas';
import IngredientChip from '../components/pizza/IngredientChip';

// Custom price counter micro-interaction hook
const PriceDisplay = ({ value }) => {
  const [displayPrice, setDisplayPrice] = useState(value);

  useEffect(() => {
    let start = displayPrice;
    let end = value;
    if (start === end) return;

    const duration = 250; // ms
    const startTime = performance.now();

    const anim = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (end - start) * progress;
      setDisplayPrice(current);

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        setDisplayPrice(end);
      }
    };

    requestAnimationFrame(anim);
  }, [value]);

  return <span>₹{displayPrice.toFixed(2)}</span>;
};

// Pizza Loader animation with circular slice cutout
const PizzaLoader = () => (
  <div className="flex flex-col items-center justify-center p-24 min-h-[50vh] space-y-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
      className="w-16 h-16 relative"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Outer Crust */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="#e4e4d9" strokeWidth="8" />
        {/* Tomato sauce slices cutout */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#e23e20"
          strokeWidth="8"
          strokeDasharray="60 140"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
    <p className="text-stone-500 font-extrabold text-sm animate-pulse tracking-wider">Cooking Customizer Studio...</p>
  </div>
);

export const PizzaBuilder = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { options, loading, error } = useAppSelector((state) => state.pizza);
  const cartItemsCount = useAppSelector((state) => state.cart.items.length);

  // Customization selection state
  const [size, setSize] = useState('medium');
  const [selectedBase, setSelectedBase] = useState(null);
  const [selectedSauce, setSelectedSauce] = useState(null);
  const [selectedCheese, setSelectedCheese] = useState(null);
  const [selectedVeggies, setSelectedVeggies] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  // Top Progress Wizard active step
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Size', 'Crust Base', 'Sauce', 'Cheese Blend', 'Veggie Toppings'];

  useEffect(() => {
    dispatch(fetchPizzaOptions());
  }, [dispatch]);

  // Set default selections once options are loaded or load pre-selected combo preset
  useEffect(() => {
    if (options.length > 0) {
      const presetData = sessionStorage.getItem('pizzaPreset');
      if (presetData) {
        try {
          const preset = JSON.parse(presetData);
          const matchBase = options.find((o) => o.type === 'base' && o.name.toLowerCase().includes(preset.base.toLowerCase()));
          const matchSauce = options.find((o) => o.type === 'sauce' && o.name.toLowerCase().includes(preset.sauce.toLowerCase()));
          const matchCheese = options.find((o) => o.type === 'cheese' && o.name.toLowerCase().includes(preset.cheese.toLowerCase()));
          const matchVeggies = options.filter((o) => o.type === 'veggies' && preset.veggies.some((vName) => o.name.toLowerCase().includes(vName.toLowerCase())));

          if (matchBase) setSelectedBase(matchBase);
          if (matchSauce) setSelectedSauce(matchSauce);
          if (matchCheese) setSelectedCheese(matchCheese);
          if (matchVeggies.length > 0) setSelectedVeggies(matchVeggies);

          sessionStorage.removeItem('pizzaPreset');
          return; // Skip defaults
        } catch (err) {
          console.error('Error preloading preset:', err);
        }
      }

      const bases = options.filter((o) => o.type === 'base' && o.inventoryItem?.quantity > 0);
      const sauces = options.filter((o) => o.type === 'sauce' && o.inventoryItem?.quantity > 0);
      const cheeses = options.filter((o) => o.type === 'cheese' && o.inventoryItem?.quantity > 0);

      if (bases.length > 0 && !selectedBase) setSelectedBase(bases[0]);
      if (sauces.length > 0 && !selectedSauce) setSelectedSauce(sauces[0]);
      if (cheeses.length > 0 && !selectedCheese) setSelectedCheese(cheeses[0]);
    }
  }, [options, selectedBase, selectedSauce, selectedCheese]);

  if (loading) return <PizzaLoader />;

  if (error) {
    return (
      <div className="bg-red-50 text-[#e23e20] p-6 rounded-2xl flex items-start space-x-3 border border-red-100 max-w-xl mx-auto my-12">
        <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold">Failed to load customizer catalog</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Filter options by category
  const bases = options.filter((o) => o.type === 'base');
  const sauces = options.filter((o) => o.type === 'sauce');
  const cheeses = options.filter((o) => o.type === 'cheese');
  const veggies = options.filter((o) => o.type === 'veggies');

  // Pricing calculations
  const calculateSinglePizzaPrice = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) return 0;
    let baseVal = selectedBase.price + selectedSauce.price + selectedCheese.price;
    selectedVeggies.forEach((v) => {
      baseVal += v.price;
    });

    if (size === 'medium') baseVal += 200;
    if (size === 'large') baseVal += 400;

    return parseFloat(baseVal.toFixed(2));
  };

  const singlePrice = calculateSinglePizzaPrice();
  const totalPrice = parseFloat((singlePrice * quantity).toFixed(2));

  const toggleVeggie = (veg) => {
    const isSelected = selectedVeggies.some((v) => v._id === veg._id);
    if (isSelected) {
      setSelectedVeggies(selectedVeggies.filter((v) => v._id !== veg._id));
    } else {
      setSelectedVeggies([...selectedVeggies, veg]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedBase || !selectedSauce || !selectedCheese) return;

    dispatch(
      addToCart({
        base: selectedBase,
        sauce: selectedSauce,
        cheese: selectedCheese,
        veggies: selectedVeggies,
        size,
        quantity,
        price: singlePrice,
      })
    );

    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in min-h-screen bg-[#faf8f5] p-2 md:p-6 rounded-3xl">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1c1917] tracking-tight flex items-center gap-2">
            <span className="text-[#e23e20]">🍕</span>
            <span>CrustCraft Customizer</span>
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Build your personalized pizza using live inventory stock options.
          </p>
        </div>

        {/* Bouncing Cart Button */}
        <motion.button
          onClick={() => navigate('/cart')}
          animate={addedMessage ? { scale: [1, 1.15, 0.95, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2 bg-[#1c1917] hover:bg-stone-800 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-md"
        >
          <ShoppingCart className="h-5 w-5" />
          <span>My Cart</span>
          {cartItemsCount > 0 && (
            <motion.span
              key={cartItemsCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              className="bg-[#e23e20] text-white text-xs font-black px-2.5 py-0.5 rounded-full"
            >
              {cartItemsCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      {/* Top Step Progress Bar */}
      <div className="w-full bg-white border border-stone-200 rounded-2xl p-4 flex justify-between items-center overflow-x-auto gap-4">
        {steps.map((label, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;
          return (
            <button
              key={label}
              onClick={() => setActiveStep(idx)}
              className="flex items-center space-x-2 shrink-0 group focus:outline-none"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-[#e23e20] text-white ring-4 ring-[#e23e20]/15'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-stone-100 text-stone-400 group-hover:bg-stone-200'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`text-sm font-black transition-colors ${
                  isActive ? 'text-[#e23e20]' : 'text-stone-500 group-hover:text-[#1c1917]'
                }`}
              >
                {label}
              </span>
              {idx < 4 && <div className="h-0.5 w-6 bg-stone-200 hidden md:block"></div>}
            </button>
          );
        })}
      </div>

      {/* Main Studio Canvas Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Dynamic Visual Mockup (Left Side) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-3xl p-6 flex flex-col items-center justify-center sticky top-24 shadow-sm min-h-[400px]">
          <PizzaCanvas
            size={size}
            base={selectedBase}
            sauce={selectedSauce}
            cheese={selectedCheese}
            veggies={selectedVeggies}
          />

          <div className="mt-6 text-center max-w-xs border-t border-dashed border-stone-200 pt-4 w-full">
            <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider">
              Pizza Specifications
            </span>
            <div className="mt-2 text-[#1c1917] text-sm font-bold capitalize">
              Size: <span className="text-[#e23e20]">{size}</span> &bull; Crust:{' '}
              <span className="text-[#e23e20]">{selectedBase?.name || 'None'}</span>
            </div>
            <p className="text-[10px] text-stone-400 mt-2">
              All ingredients checked dynamically against real-time bakery inventories.
            </p>
          </div>
        </div>

        {/* Customization Options Controller (Right Side) */}
        <div className="lg:col-span-7 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 0: SIZE */}
              {activeStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-[#1c1917] flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#e23e20]" />
                    <span>Choose Pizza Size</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'small', label: 'Small', details: '9 inch' },
                      { value: 'medium', label: 'Medium', details: '12 inch (+ ₹200.00)' },
                      { value: 'large', label: 'Large', details: '14 inch (+ ₹400.00)' },
                    ].map((sz) => (
                      <motion.button
                        key={sz.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSize(sz.value)}
                        className={`p-5 rounded-2xl border text-left transition-all ${
                          size === sz.value
                            ? 'border-[#e23e20] bg-orange-50/40 ring-2 ring-[#e23e20]/10'
                            : 'border-stone-200 hover:border-stone-300 bg-white'
                        }`}
                      >
                        <div className="text-sm font-black text-stone-900">{sz.label}</div>
                        <div className="text-xs text-stone-500 mt-1">{sz.details}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 1: BASE */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-[#1c1917]">Select Pizza Crust Base</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {bases.map((item) => (
                      <IngredientChip
                        key={item._id}
                        item={item}
                        isSelected={selectedBase?._id === item._id}
                        onClick={() => setSelectedBase(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: SAUCE */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-[#1c1917]">Select Italian Sauce</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {sauces.map((item) => (
                      <IngredientChip
                        key={item._id}
                        item={item}
                        isSelected={selectedSauce?._id === item._id}
                        onClick={() => setSelectedSauce(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: CHEESE */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-[#1c1917]">Select Cheese Blend</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {cheeses.map((item) => (
                      <IngredientChip
                        key={item._id}
                        item={item}
                        isSelected={selectedCheese?._id === item._id}
                        onClick={() => setSelectedCheese(item)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: TOPPINGS */}
              {activeStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-[#1c1917]">Select Veggie Toppings (Multiple)</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {veggies.map((item) => (
                      <IngredientChip
                        key={item._id}
                        item={item}
                        isSelected={selectedVeggies.some((v) => v._id === item._id)}
                        onClick={() => toggleVeggie(item)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation wizard controls */}
          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => prev - 1)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-sm bg-white text-stone-600 transition-colors ${
                activeStep === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous Step</span>
            </button>

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="flex items-center space-x-1.5 bg-[#1c1917] hover:bg-stone-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <span>Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Last step reached</span>
            )}
          </div>

          {/* Sticky Bottom Summary Bar */}
          <div className="bg-[#1c1917] rounded-3xl p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xl mt-6">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-black tracking-wider">
                Customized Pizza Price
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-black text-white">
                  <PriceDisplay value={totalPrice} />
                </span>
                <span className="text-stone-450 text-xs">for {quantity} unit(s)</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 w-full sm:w-auto shrink-0">
              <div className="flex items-center border border-stone-800 rounded-xl bg-stone-800 px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-stone-400 hover:text-white px-2.5 py-0.5 font-black text-lg"
                >
                  -
                </button>
                <span className="text-white font-bold px-3 text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-stone-400 hover:text-white px-2.5 py-0.5 font-black text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to Cart with cutout motif style */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-grow sm:flex-grow-0 flex items-center justify-center space-x-2 bg-[#e23e20] hover:bg-[#c22e17] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          {addedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500 text-white p-4 rounded-xl font-bold text-center text-sm shadow-md mt-4"
            >
              🍕 Successfully added your custom pizza to the shopping cart!
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PizzaBuilder;
