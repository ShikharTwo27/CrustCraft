import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/store';
import { Pizza, ShieldAlert, Cpu, Sparkles, ChefHat, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Home = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Pre-configured popular combinations
  const POPULAR_COMBOS = [
    {
      name: 'Paneer Tikka Fusion',
      emoji: '🧀',
      base: 'thick',
      sauce: 'bbq',
      cheese: 'mozzarella',
      veggies: ['paneer', 'onion', 'jalapeno'],
      description: 'Golden grilled paneer chunks paired with spicy jalapenos on smoky BBQ sauce.',
      price: '$12.99',
    },
    {
      name: 'Garden Veggie Delight',
      emoji: '🫑',
      base: 'thin',
      sauce: 'classic marinara',
      cheese: 'mozzarella',
      veggies: ['onion', 'mushroom', 'green pepper'],
      description: 'Crispy thin crust topped with fresh mushrooms, green capsicum, and sliced onions.',
      price: '$11.50',
    },
    {
      name: 'Classic Pepperoni Feast',
      emoji: '🍕',
      base: 'thin',
      sauce: 'classic marinara',
      cheese: 'mozzarella',
      veggies: ['pepperoni', 'basil'],
      description: 'Original recipe loaded with premium cured pepperoni disks and fresh basil leaves.',
      price: '$13.20',
    },
    {
      name: 'Sweet BBQ Crunch',
      emoji: '🌽',
      base: 'thick',
      sauce: 'bbq',
      cheese: 'mozzarella',
      veggies: ['sweet corn', 'jalapeno', 'onion'],
      description: 'Sweet corn kernels contrasted with fiery green jalapeno slices and BBQ sauce.',
      price: '$11.80',
    },
  ];

  const handleSelectCombo = (combo) => {
    localStorage.setItem('pizzaPreset', JSON.stringify(combo));
    navigate('/builder');
  };

  return (
    <div className="space-y-16 min-h-screen bg-[#faf8f5] p-2 md:p-6 rounded-3xl text-[#1c1917]">
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-white px-6 py-16 sm:px-16 sm:py-24 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_3%_3%,#e23e2015,transparent)] opacity-85"></div>
        <div className="relative max-w-2xl text-left z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full text-orange-400 text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="h-3 w-3 text-[#e23e20]" />
            <span>Smart Customization Engine</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white"
          >
            Craft Your Perfect <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-[#e23e20]">
              Inventory-Aware
            </span>{' '}
            Pizza
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-lg"
          >
            CrustCraft links your custom pizza combinations directly to our live kitchen stock.
            Out-of-stock options disappear dynamically. Build with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            {isAuthenticated ? (
              <Link
                to="/builder"
                className="flex items-center justify-center space-x-2 bg-[#e23e20] hover:bg-[#c22e17] text-white text-base font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#e23e20]/20 transition-all hover:-translate-y-0.5"
              >
                <ChefHat className="h-5 w-5" />
                <span>Build Your Pizza</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center justify-center bg-[#e23e20] hover:bg-[#c22e17] text-white text-base font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#e23e20]/20 transition-all hover:-translate-y-0.5"
                >
                  <span>Create Account</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/15 text-white text-base font-bold px-8 py-4 rounded-xl transition-all"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Dynamic Spinning Pizza Plate */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center pointer-events-none z-0">
          <div className="relative">
            <div className="absolute inset-0 bg-[#e23e20] rounded-full blur-[120px] opacity-15"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
              className="h-72 w-72 rounded-full border-4 border-dashed border-stone-800 flex items-center justify-center p-8 opacity-40"
            >
              <Pizza className="h-52 w-52 text-[#e23e20]" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* 2. POPULAR COMBOS SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Popular Combinations</h2>
            <p className="text-stone-500 text-sm mt-1">Tap a featured recipe to preload it straight into our Builder Studio.</p>
          </div>
          <span className="text-xs text-stone-400 font-bold uppercase tracking-wider hidden md:block">Swipe to view all &rarr;</span>
        </div>

        {/* Horizontal Scroll-Snap Carousel */}
        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-thin scroll-snap-x snap-mandatory scroll-smooth touch-pan-x">
          {POPULAR_COMBOS.map((combo) => (
            <motion.button
              key={combo.name}
              whileHover={{ y: -4 }}
              onClick={() => handleSelectCombo(combo)}
              className="flex-shrink-0 w-80 bg-white border border-stone-200 rounded-3xl p-6 text-left flex flex-col justify-between h-72 snap-start shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group focus:outline-none"
            >
              {/* Corner accent circle cutout shape */}
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-orange-50 group-hover:bg-[#e23e20]/10 transition-colors flex items-center justify-center">
                <span className="text-xl pt-2 pr-2">{combo.emoji}</span>
              </div>

              <div className="space-y-3 pr-6">
                <h3 className="text-lg font-black text-stone-900 capitalize">{combo.name}</h3>
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">{combo.description}</p>
                <div className="flex gap-1.5 flex-wrap capitalize pt-2">
                  <span className="bg-stone-100 text-stone-600 text-[9px] font-black px-2 py-0.5 rounded">{combo.base} crust</span>
                  <span className="bg-stone-100 text-stone-600 text-[9px] font-black px-2 py-0.5 rounded">{combo.sauce}</span>
                </div>
              </div>

              <div className="flex justify-between items-center w-full border-t border-stone-100 pt-4">
                <span className="text-lg font-black text-[#e23e20]">{combo.price}</span>
                <span className="flex items-center text-xs font-black text-stone-850 gap-1 group-hover:text-[#e23e20] transition-colors">
                  <span>Customise</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 3. FEATURES SECTION */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <Cpu className="h-6 w-6" />,
            title: 'Live Stock Linking',
            desc: 'Every crust, sauce, cheese, and veggie is monitored dynamically. Out-of-stock items disable automatically in the builder.',
          },
          {
            icon: <Pizza className="h-6 w-6" />,
            title: 'Modular Customizer',
            desc: 'Build your pizza layer by layer. Choose your crust depth, Italian sauces, cheese density, and organic fresh toppings.',
          },
          {
            icon: <ShieldAlert className="h-6 w-6" />,
            title: 'Real-time WebSocket Feeds',
            desc: 'Watch preparation progress live as updates stream directly to your order summary map through persistent sockets.',
          },
        ].map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-[#e23e20]/10 text-[#e23e20] p-3.5 rounded-2xl w-fit mb-6">
              {feat.icon}
            </div>
            <h3 className="text-lg font-black text-stone-900 mb-3">{feat.title}</h3>
            <p className="text-xs text-stone-500 leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
