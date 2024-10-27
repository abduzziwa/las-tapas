"use client";

import React, { useState, useEffect } from "react";
import TopNavBar from "../components/TopNavBar";
import BottomNavBar from "../components/BottomNavBar";
import { endpoints } from "../api/endpoint";

interface FoodItem {
  foodId: string;
  name: string;
  quantity: number;
  modification?: string;
  price: number;
  category: string;
}

interface Order {
  orderId: string;
  sessionId: string;
  tableNumber: string;
  foodItems: FoodItem[];
  status: "ordered" | "served";
  payment: "paid" | "unpaid";
  timestamps: {
    orderedAt: string;
    cookingStartedAt?: string;
  };
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // const sessionId = sessionStorage.getItem("sessionId");
        const sessionId = sessionStorage.getItem("sessionId");

        if (!sessionId) {
          throw new Error("No session ID found");
        }
        const response = await fetch(
          `http://${endpoints.next_ip_port}/api/orders/clientOrderlistOrdered?sessionId=${sessionId}`
        );
        if (!response.ok) {
          const message = await response.json();

          return <h1>{message.message}</h1>;
        }
        const data: Order[] = await response.json();
        setOrders(data);

        // Store unpaid orders' foodItems in localStorage
        const unpaidOrders = data.filter((order) => order.payment === "unpaid");
        const unpaidFoodItems = unpaidOrders.flatMap(
          (order) => order.foodItems
        );
        localStorage.setItem("BillItems", JSON.stringify(unpaidFoodItems));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: Order["status"]) => {
    return status === "ordered"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const getPaymentStatusColor = (payment: Order["payment"]) => {
    return payment === "paid"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-100">
      <TopNavBar />
      <div className="flex-grow overflow-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        {loading && <p className="text-gray-600">Loading orders...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-gray-600 text-4xl font-bold">No orders found.</p>
        )}
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white shadow rounded-lg p-4 mb-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Order ID: {order.orderId}</span>
              <div className="flex space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${getPaymentStatusColor(
                    order.payment
                  )}`}
                >
                  {order.payment}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Table: {order.tableNumber}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Ordered at: {formatDate(order.timestamps.orderedAt)}
            </p>
            <div className="mt-2">
              <h3 className="font-semibold mb-1">Items:</h3>
              <ul className="list-disc list-inside">
                {order.foodItems.map((item, index) => (
                  <li key={index} className="text-sm">
                    {item.name} x{item.quantity} - €
                    {(item.price * item.quantity).toFixed(2)}
                    {item.modification && (
                      <span className="text-gray-500 ml-1">
                        ({item.modification})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 text-right">
              <span className="font-semibold">
                Total: €
                {order.foodItems
                  .reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <BottomNavBar />
    </main>
  );
}
