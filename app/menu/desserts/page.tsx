'use client';
import React, { useState, useEffect } from 'react';
import TopNavBar from '../../components/TopNavBar';
import BottomNavBar from '../../components/BottomNavBar';
import MealComponent from '../../components/MealComponent';
import MealPopup from '@/app/components/MealPopup';
import AuthGuard from '@/app/components/AuthGuard';
import { Meal } from '../foods/page';

interface OrderItem {
  foodId: string; name: string; quantity: number;
  modification: string; price: number; category: string;
}

export default function Desserts() {
  const [meals,          setMeals]          = useState<Meal[]>([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedMeal,   setSelectedMeal]   = useState<Meal | null>(null);
  const [cartItems,      setCartItems]      = useState<OrderItem[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('CartItems');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) localStorage.setItem('CartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    fetch('/api/menu/desserts')
      .then(r => r.ok ? r.json() : [])
      .then((data: Meal[]) => setMeals(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleAddToCart = (mealData: {
    foodId: string; foodName: string; quantity: number;
    foodPrice: number; modification: string; category: string;
  }) => {
    setCartItems(prev => [...prev, {
      foodId: mealData.foodId, name: mealData.foodName,
      quantity: mealData.quantity, modification: mealData.modification,
      price: mealData.foodPrice, category: mealData.category,
    }]);
  };

  return (
    <AuthGuard>
      <main className="flex flex-col min-h-screen bg-gray-50">
        <TopNavBar />

        <div
          className="mx-3 mt-3 rounded-2xl h-28 flex items-end px-5 pb-4 overflow-hidden relative shadow-md"
          style={{ background: 'linear-gradient(135deg,#6b2f5a,#9b4d8b)' }}
        >
          <div className="absolute inset-0 opacity-25"
            style={{ background: 'radial-gradient(circle at 70% 40%,#c87fba,transparent 60%)' }} />
          <h1 className="relative text-white text-3xl font-bold drop-shadow-sm">Desserts</h1>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="w-10 h-10 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : meals.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🍰</p>
            <p className="text-base font-medium">No items available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-3 pb-28 sm:grid-cols-3 md:grid-cols-4">
            {meals.map(meal => (
              <MealComponent key={meal.foodId} meal={meal} onMealClick={() => { setSelectedMeal(meal); setIsPopupVisible(true); }} />
            ))}
          </div>
        )}

        {selectedMeal && (
          <MealPopup
            visibility={isPopupVisible ? '' : 'hidden'}
            onClose={() => { setIsPopupVisible(false); setSelectedMeal(null); }}
            meal={selectedMeal}
            onAddToCart={handleAddToCart}
          />
        )}

        <BottomNavBar />
      </main>
    </AuthGuard>
  );
}
