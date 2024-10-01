"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import backspaceIcon from '../../public/backspace.svg';
import controlIcon from '../../public/ctrl-backspace.svg';
import TopNavBar from '../components/TopNavBar';

const Login: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('e');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  useEffect(() => {
    if (errorMessage) {
      const interval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            setErrorMessage(null);
            return 10;
          }
          return prevCountdown - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [errorMessage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with employeeId:', employeeId);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ employeeId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.role) {
          router.push(`/${data.role}`);
          setErrorMessage(null);
        } else {
          setError('Invalid employee ID or role not found');
        }
      } else {
        setError('Failed to authenticate. Please check your employee ID.');
      }
    } catch (error) {
      console.error('Error during fetch:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('e')) {
      setEmployeeId(value);
    }
  };

  const handleNumberClick = (number: string) => {
    setEmployeeId((prev) => prev + number);
  };

  const handleBackspace = () => {
    setEmployeeId((prev) => prev.slice(0, -1));
    setEmployeeId('e');
  };

  const handleControlBackspace = () => {
    setEmployeeId('e');
  };

  const setError = (message: string) => {
    if (message === errorMessage) {
      setCountdown(10); // Reset countdown if the same error message is set again
    } else {
      setErrorMessage(message); // Set new error message
      setCountdown(10); // Reset countdown for new error message
    }
  };

  return (
    <>
      <TopNavBar />
      <div className="flex flex-col items-center justify-end max-h-[100vh] overflow-y-auto py-[125px]">
        {errorMessage && (
          <div className="mb-auto flex flex-col w-auto h-[100px] p-[25px] justify-between items-start rounded-[18px] shadow-md bg-custom-gradient">
            <span>{errorMessage}</span>
            <span>Disappearing in {countdown} seconds.</span>
          </div>
        )}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={employeeId}
            onChange={handleChange}
            placeholder="Enter Employee ID"
            readOnly
            className="flex w-[315px] h-[150px] p-[25px] justify-center items-center shrink-0 rounded-[18px] outline-0 text-right shadow-md"
          />
          <div className="grid grid-cols-3 gap-[5px] max-w-[315px] content-center place-items-center select-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleNumberClick(num.toString())}
                className="h-[100px] w-[100px] rounded-[18px] leading-[100px] text-black text-[50px] text-center flex justify-center items-center shadow-md hover:bg-[#F95E07] p-[10px]"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-[100px] w-[100px] rounded-[18px] leading-[100px] flex justify-center items-center shadow-md hover:bg-[#F95E07] p-[10px]"
            >
              <img src={backspaceIcon.src} alt="Backspace" className="w-[40px] h-[40px]" />
            </button>
            <button
              type="button"
              onClick={handleControlBackspace}
              className="h-[100px] w-[100px] rounded-[18px] leading-[100px] flex justify-center items-center shadow-md hover:bg-[#F95E07] p-[10px]"
            >
              <img src={controlIcon.src} alt="Control Backspace" className="w-[40px] h-[40px]" />
            </button>
          </div>
          <button
            type="submit"
            className="mt-[20px] bg-[#F95E07] w-[315px] h-[50px] rounded-[18px] text-white shadow-md hover:shadow-[inset_4px_4px_4px_rgba(0,0,0,0.25)] transition-all duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
