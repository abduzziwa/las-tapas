// app/loginSystem/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cp } from 'fs';

const Login: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('e');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with employeeId:', employeeId); // Debugging line

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data[0].role);
      
      console.log('Response from API:', data); // Debugging line
      
      if (data[0].role) {
        router.push(`/${data.role}`);
      } else {
        alert('Invalid employee ID');
      }
    } catch (error) {
      console.error('Error during fetch:', error); // Debugging line
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('e')) {
      setEmployeeId(value);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        value={employeeId}
        onChange={handleChange}
        placeholder="Enter Employee ID"
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
