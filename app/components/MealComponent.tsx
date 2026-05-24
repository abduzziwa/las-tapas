import React from 'react';
import { Meal } from '../menu/foods/page';

interface Props {
  meal: Meal;
  onMealClick: () => void;
}

const MealComponent: React.FC<Props> = ({ meal, onMealClick }) => {
  const hasImage = Boolean(meal.imageUrl);

  return (
    <button
      onClick={onMealClick}
      className="relative w-full overflow-hidden rounded-2xl text-left focus:outline-none active:scale-[0.97] transition-transform"
      style={{ aspectRatio: '3/4', background: '#2a1206' }}
    >
      {/* Background image or gradient */}
      {hasImage ? (
        <img
          src={meal.imageUrl}
          alt={meal.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(145deg,#3d1800,#7a3412)' }}
        />
      )}

      {/* Overlay gradient for text legibility */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)',
      }} />

      {/* Dietary badges */}
      <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
        {meal.halal && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-600 text-white leading-tight">
            Halal
          </span>
        )}
        {meal.vegetarian && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white leading-tight">
            Veg
          </span>
        )}
      </div>

      {/* Text content */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5">
        <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow">
          {meal.name}
        </h3>
        <p className="text-white/75 text-xs mt-0.5 font-semibold">€{meal.price.toFixed(2)}</p>
      </div>
    </button>
  );
};

export default MealComponent;
