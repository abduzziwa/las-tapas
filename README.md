# Restaurant Management Website - README

## Overview

This repository contains the codebase for the **Las Tapas** restaurant management system. The website is designed to streamline various aspects of the restaurant's operations, including customer ordering, employee management, menu and inventory management, sales reporting, and customer feedback. This system integrates all essential features needed to manage a restaurant efficiently, both on the front-end and back-end.

## Features

### Customer Features
- **Menu Browsing:** Customers can explore the full menu, organized by categories such as appetizers, main courses, desserts, and beverages. Each item comes with a detailed description, pricing, and customization options (e.g., extra toppings, dietary preferences).
- **Order Placement:** Customers can place orders for dine-in, takeaway, or delivery, with support for various payment methods including credit cards, PayPal, and cash on delivery.
- **Order Tracking:** Real-time order tracking allows customers to see the status of their order, from preparation to delivery or pickup, with notifications at each stage.
- **User Accounts:** Customers can register for an account to save their favorite orders, view their order history, and reorder with ease.
- **Promotions & Discounts:** Customers can apply promotional codes and discounts at checkout.
- **Reviews & Ratings:** After their meal, customers can leave reviews and ratings for dishes, helping to improve the overall dining experience.

### 2. Employee Features
- **Order Management:** Employees have access to a detailed overview of all current orders, including customer information, order details, and special instructions. They can update order statuses, ensuring efficient order processing.
- **Order History:** Employees can view a searchable history of all orders, which aids in handling customer queries, processing refunds, and analyzing sales trends.
- **Menu Management:** Authorized staff can update the menu, adding, editing, or removing items, and adjusting prices or availability as needed.
- **Inventory Management:** The system includes inventory tracking, allowing staff to monitor stock levels and mark items as out of stock.
- **Employee Accounts:** Each employee has a personalized account with role-based access controls, ensuring that only authorized users can perform certain tasks like menu management.
- **Shift Management:** Employees can view and manage their work schedules, swap shifts, and receive notifications about upcoming shifts.

### 3. Admin Features
- **User Management:** Admins have full control over user accounts, including the ability to reset passwords, change user roles, and deactivate accounts as needed.
- **Analytics Dashboard:** A comprehensive dashboard provides insights into restaurant performance, including sales metrics, customer demographics, and inventory levels.
- **Feedback Management:** Admins can monitor and respond to customer feedback, helping to maintain high service standards.
- **Loyalty Program Management:** The system supports a customer loyalty program, allowing admins to configure point-based rewards for frequent diners.
- **Reporting & Analytics:** Generate detailed reports on sales, inventory, employee performance, and customer satisfaction. These reports can be filtered by various criteria, such as time periods or specific menu items.

### 4. Additional Features
- **Reservation System:** Customers can make reservations directly through the website, with the system handling availability and confirmation.
- **Event Management:** Admins can create and manage events (e.g., live music, themed nights), allowing customers to RSVP or purchase tickets online.
- **Customer Support Chat:** Integrated chat support helps customers get answers to their questions in real-time, improving the overall user experience.

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** next.js
- **Database:** MongoDB (for user accounts, order history, menu items, inventory, etc.)
- **Authentication:** JWT (JSON Web Tokens) for secure user sessions
- **Payment Processing:** Stripe API for handling payments
- **Real-Time Updates:** Socket.io for real-time order tracking and notifications

## Usage
- **Customers** Customers: Sign up or log in to your account, browse the menu, place an order, track its progress, make reservations, and manage your profile.
- **Employees** Log in to manage orders, update the menu, track inventory, and view your work schedule.
- **Admins** Access the admin dashboard to manage users, view detailed analytics, maintain the feedback system, and manage events and loyalty programs.

## Contact Developers
- **Abdul:** abdul.[achternaam]@student.gildeopleidingen.nl
- **Bryce:** bryce.van.der.werf.@student.gildeopleidingen.nl
- **Chris:** chris.[achternaam]@student.gildeopleidingen.nl
- **Djaro:** djaro.[achternaam]@student.gildeopleidingen.nl

Thank you for using our restaurant management system! We hope it enhances your dining and operational experience.