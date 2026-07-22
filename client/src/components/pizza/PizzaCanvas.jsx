import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Pre-defined scatter points for toppings (to distribute them evenly but organically across the pizza)
const TOPPING_COORDINATES = [
  // Outer Ring
  { x: 150, y: 65 },
  { x: 210, y: 85 },
  { x: 235, y: 140 },
  { x: 220, y: 205 },
  { x: 165, y: 235 },
  { x: 100, y: 225 },
  { x: 65, y: 175 },
  { x: 68, y: 110 },
  { x: 105, y: 72 },
  // Middle Ring
  { x: 150, y: 100 },
  { x: 190, y: 120 },
  { x: 200, y: 165 },
  { x: 165, y: 195 },
  { x: 120, y: 185 },
  { x: 100, y: 140 },
  // Inner Core
  { x: 150, y: 145 },
  { x: 130, y: 120 },
  { x: 170, y: 135 },
];

export const PizzaCanvas = ({ size = 'medium', base, sauce, cheese, veggies = [] }) => {
  // Determine scale factor based on selected size
  const sizeScales = {
    small: 0.85,
    medium: 1.0,
    large: 1.15,
  };
  const scale = sizeScales[size] || 1.0;

  // Determine sauce gradient colors
  const getSauceColors = () => {
    const name = (sauce?.name || '').toLowerCase();
    if (name.includes('bbq')) return { start: '#5c2d15', end: '#3b1c0b' };
    if (name.includes('alfredo') || name.includes('white')) return { start: '#fafaf6', end: '#e4e4d9' };
    return { start: '#ef4444', end: '#b91c1c' }; // Default tomato/marinara red
  };

  const sauceColors = getSauceColors();

  // Determine crust color gradient based on base selection
  const getCrustColors = () => {
    const name = (base?.name || '').toLowerCase();
    if (name.includes('gluten')) return { start: '#eab308', end: '#b45309' }; // Gluten Free (Golden)
    if (name.includes('thin')) return { start: '#f59e0b', end: '#b45309' }; // Thin (Browned)
    return { start: '#fbbf24', end: '#d97706' }; // Default Thick/Regular (Warm Amber)
  };

  const crustColors = getCrustColors();

  // Render individual topping SVG elements
  const renderToppingShape = (toppingName, coord, idx) => {
    const name = toppingName.toLowerCase();

    // 1. PEPPERONI
    if (name.includes('pepperoni')) {
      return (
        <g key={`pep-${idx}`} transform={`translate(${coord.x}, ${coord.y})`}>
          {/* Main cured meat slice */}
          <circle r="12" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5" filter="url(#dropShadow)" />
          {/* Internal fat flecks */}
          <circle cx="-4" cy="-4" r="1.5" fill="#fecaca" opacity="0.8" />
          <circle cx="5" cy="-2" r="1.2" fill="#fecaca" opacity="0.8" />
          <circle cx="-2" cy="6" r="1.5" fill="#fecaca" opacity="0.8" />
          <circle cx="3" cy="4" r="1.2" fill="#fecaca" opacity="0.8" />
          {/* Curled, slightly charred edges */}
          <circle r="12" fill="none" stroke="#7f1d1d" strokeWidth="1" strokeDasharray="6 3" />
        </g>
      );
    }

    // 2. MUSHROOM
    if (name.includes('mushroom')) {
      return (
        <g key={`mush-${idx}`} transform={`translate(${coord.x}, ${coord.y}) scale(0.95)`}>
          {/* Mushroom Cap */}
          <path
            d="M -10 -2 C -10 -12 10 -12 10 -2 C 10 1 8 3 4 3 C 4 7 2 9 -2 9 C -2 7 -4 3 -8 3 C -9 3 -10 1 -10 -2 Z"
            fill="#f5f5f4"
            stroke="#a8a29e"
            strokeWidth="1.2"
            filter="url(#dropShadow)"
          />
          {/* Cap details / gills */}
          <path d="M -6 0 C -6 -4 -3 -5 -2 -2" stroke="#d6d3d1" strokeWidth="1" fill="none" />
          <path d="M 6 0 C 6 -4 3 -5 2 -2" stroke="#d6d3d1" strokeWidth="1" fill="none" />
        </g>
      );
    }

    // 3. GREEN PEPPER / CAPSICUM
    if (name.includes('pepper') || name.includes('capsicum') || name.includes('jalapeno')) {
      const color = name.includes('jalapeno') ? '#15803d' : '#166534';
      const strokeColor = name.includes('jalapeno') ? '#14532d' : '#14532d';
      return (
        <g key={`pep-${idx}`} transform={`translate(${coord.x}, ${coord.y}) rotate(${idx * 45})`}>
          {/* Curved Pepper strip */}
          <path
            d="M -8 -8 C -1 -10 6 -6 8 2 C 7 3 5 3 4 0 C 2 -4 -3 -6 -6 -4 C -8 -3 -8 -5 -8 -8 Z"
            fill={color}
            stroke={strokeColor}
            strokeWidth="1.2"
            filter="url(#dropShadow)"
          />
        </g>
      );
    }

    // 4. ONION
    if (name.includes('onion')) {
      return (
        <g key={`onion-${idx}`} transform={`translate(${coord.x}, ${coord.y}) rotate(${idx * 30})`}>
          {/* Purple Onion Ring slice */}
          <path
            d="M -11 0 A 11 11 0 1 0 11 0 A 11 11 0 1 0 -11 0 Z M -8 0 A 8 8 0 1 1 8 0 A 8 8 0 1 1 -8 0 Z"
            fill="#fae8ff"
            stroke="#c084fc"
            strokeWidth="2"
            filter="url(#dropShadow)"
          />
        </g>
      );
    }

    // 5. BLACK OLIVES
    if (name.includes('olive')) {
      return (
        <g key={`olive-${idx}`} transform={`translate(${coord.x}, ${coord.y})`}>
          <circle r="7.5" fill="#1c1917" stroke="#0c0a09" strokeWidth="1" filter="url(#dropShadow)" />
          <circle cx="0" cy="0" r="3.2" fill="#991b1b" opacity="0.15" /> {/* Inner empty cutout */}
          <circle cx="0" cy="0" r="2.8" fill="#f59e0b" opacity="0.05" />
        </g>
      );
    }

    // 6. SWEET CORN
    if (name.includes('corn') || name.includes('maize')) {
      return (
        <g key={`corn-${idx}`} transform={`translate(${coord.x}, ${coord.y}) scale(0.95)`}>
          <ellipse rx="5.5" ry="4" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" filter="url(#dropShadow)" />
          {/* Highlight glint */}
          <ellipse rx="2" ry="1.2" cx="-1.5" cy="-1" fill="#fef08a" />
        </g>
      );
    }

    // 7. PANEER / TOFU
    if (name.includes('paneer') || name.includes('tofu') || name.includes('cottage')) {
      return (
        <g key={`paneer-${idx}`} transform={`translate(${coord.x}, ${coord.y}) rotate(${idx * 15})`}>
          {/* Paneer Cube top */}
          <rect x="-7" y="-7" width="14" height="14" rx="1.5" fill="#fcfcf9" stroke="#e4e4d9" strokeWidth="1.2" filter="url(#dropShadow)" />
          {/* Charred grilled marks */}
          <line x1="-3" y1="-3" x2="3" y2="3" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </g>
      );
    }

    // 8. BASIL
    if (name.includes('basil') || name.includes('herb')) {
      return (
        <g key={`basil-${idx}`} transform={`translate(${coord.x}, ${coord.y}) rotate(${idx * 75})`}>
          <path
            d="M 0 8 C -8 3 -10 -4 0 -10 C 10 -4 8 3 0 8"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="1"
            filter="url(#dropShadow)"
          />
          {/* Leaf vein */}
          <path d="M 0 -8 C 0 -2 0 4 0 7" stroke="#166534" strokeWidth="0.8" fill="none" />
        </g>
      );
    }

    // DEFAULT GENERIC VEGGIE DOT
    return (
      <g key={`gen-${idx}`} transform={`translate(${coord.x}, ${coord.y})`}>
        <circle r="6" fill="#fb923c" stroke="#ea580c" strokeWidth="1" filter="url(#dropShadow)" />
      </g>
    );
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      <motion.div
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="w-72 h-72 sm:w-96 sm:h-96 relative flex items-center justify-center filter drop-shadow-xl"
      >
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* SVG Definitions for Gradients and Filters */}
          <defs>
            {/* Crust Gradients */}
            <radialGradient id="crustGrad" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor={crustColors.start} />
              <stop offset="100%" stopColor={crustColors.end} />
            </radialGradient>

            {/* Sauce Gradients */}
            <radialGradient id="sauceGrad" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor={sauceColors.start} />
              <stop offset="100%" stopColor={sauceColors.end} />
            </radialGradient>

            {/* Cheese Melt Filter for Blended Look */}
            <filter id="cheeseMelt" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>

            {/* Dropshadow for Toppings */}
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2.5" stdDeviation="1.5" floodColor="#292524" floodOpacity="0.45" />
            </filter>

            {/* Crust Shadow Filter */}
            <filter id="crustShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#1c1917" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* 1. PIZZA CRUST BASE */}
          <circle
            cx="150"
            cy="150"
            r="125"
            fill="url(#crustGrad)"
            filter="url(#crustShadow)"
          />

          {/* Crispy baked spots on the outer crust rim */}
          <g opacity="0.6">
            <ellipse cx="60" cy="80" rx="6" ry="3" fill="#78350f" transform="rotate(-30, 60, 80)" />
            <ellipse cx="230" cy="90" rx="7" ry="4" fill="#78350f" transform="rotate(40, 230, 90)" />
            <ellipse cx="110" cy="265" rx="5" ry="2.5" fill="#78350f" transform="rotate(10, 110, 265)" />
            <ellipse cx="255" cy="180" rx="6" ry="3" fill="#78350f" transform="rotate(-15, 255, 180)" />
            <ellipse cx="40" cy="160" rx="8" ry="4" fill="#78350f" transform="rotate(50, 40, 160)" />
          </g>

          {/* Inner Base line showing hand stretched ring */}
          <circle
            cx="150"
            cy="150"
            r="108"
            fill="none"
            stroke="#b45309"
            strokeWidth="1.5"
            strokeDasharray="10 5"
            opacity="0.35"
          />

          {/* 2. PIZZA SAUCE LAYER */}
          {sauce && (
            <circle
              cx="150"
              cy="150"
              r="104"
              fill="url(#sauceGrad)"
            />
          )}

          {/* 3. CHEESE LAYER (Melted Mozzarella) */}
          {cheese && (
            <g filter="url(#cheeseMelt)">
              {/* Main circular cheese coating */}
              <circle
                cx="150"
                cy="150"
                r="95"
                fill="#fef08a"
                opacity="0.88"
              />
              {/* Extra melted outer blobs for organic edge shapes */}
              <circle cx="150" cy="58" r="14" fill="#fef08a" opacity="0.9" />
              <circle cx="215" cy="95" r="12" fill="#fef08a" opacity="0.9" />
              <circle cx="235" cy="160" r="15" fill="#fef08a" opacity="0.9" />
              <circle cx="178" cy="235" r="13" fill="#fef08a" opacity="0.9" />
              <circle cx="95" cy="225" r="16" fill="#fef08a" opacity="0.9" />
              <circle cx="65" cy="140" r="12" fill="#fef08a" opacity="0.9" />
              <circle cx="90" cy="85" r="15" fill="#fef08a" opacity="0.9" />
            </g>
          )}

          {/* Baked cheese bubble spots */}
          {cheese && (
            <g opacity="0.85">
              <circle cx="140" cy="110" r="6" fill="#eab308" opacity="0.75" />
              <circle cx="180" cy="170" r="8" fill="#ca8a04" opacity="0.8" />
              <circle cx="105" cy="165" r="5" fill="#ca8a04" opacity="0.7" />
              <circle cx="205" cy="115" r="7" fill="#eab308" opacity="0.8" />
              <circle cx="150" cy="210" r="6" fill="#ca8a04" opacity="0.75" />
            </g>
          )}

          {/* 4. VEGGIE TOPPINGS LAYER */}
          <g>
            <AnimatePresence>
              {(veggies || []).map((veg, idxOuter) => {
                if (!veg || !veg.name) return null;
                // Scatter multiple items of this veggie across pre-defined coordinates
                return TOPPING_COORDINATES.map((coord, idx) => {
                  // Only scatter on a subset based on index hashing so different toppings don't stack directly
                  const salt = veg._id ? veg._id.charCodeAt(veg._id.length - 1) || 0 : 0;
                  const showTopping = (idx + salt) % 3 === 0;

                  if (!showTopping) return null;

                  // Add slight random offset to coordinates for organic placement
                  const randomizedCoord = {
                    x: coord.x + ((idx * 7) % 9) - 4,
                    y: coord.y + ((idx * 13) % 9) - 4,
                  };

                  return (
                    <motion.g
                      key={`topping-${veg._id}-${idx}`}
                      initial={{ scale: 0, opacity: 0, rotate: -45 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 18,
                        delay: (idx * 0.015) % 0.15,
                      }}
                    >
                      {renderToppingShape(veg.name, randomizedCoord, idx)}
                    </motion.g>
                  );
                });
              })}
            </AnimatePresence>
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

export default PizzaCanvas;
