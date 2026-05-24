'use client';
import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meal } from '../menu/foods/page';

interface Props {
  visibility: 'hidden' | '';
  onClose: () => void;
  meal: Meal;
  onAddToCart: (mealData: {
    foodId: string;
    foodName: string;
    quantity: number;
    foodPrice: number;
    modification: string;
    category: string;
  }) => void;
}

const MealPopup: React.FC<Props> = ({ visibility, onClose, meal, onAddToCart }) => {
  const [quantity,     setQuantity]     = useState(1);
  const [modification, setModification] = useState('');
  const isVisible = visibility === '';

  // Reset state when opening a new meal
  useEffect(() => {
    if (isVisible) { setQuantity(1); setModification(''); }
  }, [isVisible, meal.foodId]);

  const handleAdd = () => {
    onAddToCart({
      foodId: meal.foodId, foodName: meal.name,
      foodPrice: meal.price, quantity,
      modification: modification || 'none',
      category: meal.category,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 px-0 sm:px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(160deg,#F95E07,#c05a10)' }}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0,      opacity: 1 }}
            exit={{   y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/40" />
            </div>

            {/* Close */}
            <button onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center active:bg-white/30 transition-colors z-10">
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Image + details */}
            <div className="flex gap-4 px-5 pt-4 pb-3">
              {meal.imageUrl ? (
                <img src={meal.imageUrl} alt={meal.name}
                  className="w-28 h-28 rounded-2xl object-cover flex-shrink-0 shadow-md" />
              ) : (
                <div className="w-28 h-28 rounded-2xl flex-shrink-0 bg-white/15 flex items-center justify-center text-4xl shadow-md">
                  🍽️
                </div>
              )}
              <div className="flex flex-col justify-between py-0.5 min-w-0">
                <div>
                  <h3 className="text-white font-bold text-lg leading-snug line-clamp-2">{meal.name}</h3>
                  {meal.ingredients.length > 0 ? (
                    <p className="text-white/75 text-xs mt-1 line-clamp-3 leading-snug">
                      <span className="font-semibold">Ingredients:</span> {meal.ingredients.join(', ')}
                    </p>
                  ) : (
                    <p className="text-white/75 text-xs mt-1 line-clamp-3 leading-snug">{meal.description}</p>
                  )}
                </div>
                <p className="text-white font-bold text-xl mt-2">€{meal.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Dietary */}
            <div className="flex gap-2 px-5 pb-3">
              {meal.halal && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">Halal</span>
              )}
              {meal.vegetarian && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">Vegetarian</span>
              )}
            </div>

            {/* Modification */}
            <div className="px-5 pb-4">
              <input
                type="text"
                className="w-full rounded-xl px-4 py-3 text-sm bg-white/95 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
                placeholder="Any modifications? (e.g. no onion)"
                value={modification}
                onChange={e => setModification(e.target.value)}
                style={{ fontSize: 16 }}
              />
            </div>

            {/* Qty + Add to cart */}
            <div className="flex items-center justify-between px-5 pb-6 pt-1 gap-4">
              <div className="flex items-center gap-3 bg-white/20 rounded-2xl px-3 py-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center active:bg-white/40 transition-colors">
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="text-white font-bold text-lg w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center active:bg-white/40 transition-colors">
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>

              <button onClick={handleAdd}
                className="flex-1 py-3.5 rounded-2xl bg-white text-sm font-bold transition-all active:scale-[0.97] hover:bg-gray-50"
                style={{ color: '#c05a10' }}>
                Add · €{(meal.price * quantity).toFixed(2)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MealPopup;
