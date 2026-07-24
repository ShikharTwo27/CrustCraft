import React from 'react';
import { motion } from 'framer-motion';

export const IngredientChip = ({ item, isSelected, onClick, disabled }) => {
  const qty = item.inventoryItem?.quantity || 0;
  const isOutOfStock = qty <= 0 || disabled;

  // Determine a simple fallback icon based on category type
  const getCategoryEmoji = (type) => {
    switch (type) {
      case 'base': return '🍞';
      case 'sauce': return '🍅';
      case 'cheese': return '🧀';
      case 'veggies': return '🫑';
      default: return '🍕';
    }
  };

  return (
    <motion.button
      type="button"
      disabled={isOutOfStock}
      onClick={onClick}
      whileHover={isOutOfStock ? {} : { scale: 1.03 }}
      whileTap={isOutOfStock ? {} : { scale: 0.97 }}
      className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-full min-h-[100px] ${
        isOutOfStock
          ? 'bg-stone-50 border-stone-200 opacity-40 cursor-not-allowed'
          : isSelected
          ? 'border-[#e23e20] bg-orange-50/40 ring-2 ring-[#e23e20]/20'
          : 'border-stone-200 hover:border-stone-300 bg-white'
      }`}
    >
      <div className="flex justify-between items-start w-full gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl shrink-0" role="img" aria-label={item.name}>
            {getCategoryEmoji(item.type)}
          </span>
          <div>
            <span className="text-sm font-black text-stone-900 block capitalize">{item.name}</span>
            <span className="text-[10px] text-stone-500 block leading-tight mt-0.5">{item.description}</span>
          </div>
        </div>
        <span className="text-xs font-black text-[#e23e20] shrink-0 mt-0.5">
          +₹{item.price.toFixed(2)}
        </span>
      </div>

      {isOutOfStock ? (
        <span className="absolute bottom-2 right-2 bg-red-100 text-red-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
          Out of Stock
        </span>
      ) : (
        qty <= 10 && (
          <span className="absolute bottom-2 right-2 bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
            Only {qty} left
          </span>
        )
      )}
    </motion.button>
  );
};

export default IngredientChip;
