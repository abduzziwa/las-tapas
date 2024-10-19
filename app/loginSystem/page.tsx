"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import TopNavBar from '../components/TopNavBar';
import ErrorMessage from './components/ErrorMessage';
import NumberPad from './components/NumberPad';
import ControlBar from './components/ControlBar';
import { handleAction } from './utils/api';
import { setError } from './utils/error';

const Login: React.FC = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [shiftId, setShiftId] = useState('');
    const [breakId, setBreakId] = useState('');
    const [isBreakActive, setIsBreakActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(10);
    const router = useRouter();

    useEffect(() => {
        if (errorMessage || successMessage) {
            const interval = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 1) {
                        setErrorMessage(null);
                        setSuccessMessage(null);
                        return 10;
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [errorMessage, successMessage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setEmployeeId(value);
    };

    const handleNumberClick = (number: string) => {
        setEmployeeId((prev) => prev + number);
    };

    const handleBackspace = () => {
        setEmployeeId((prev) => prev.slice(0, -1));
    };

    const handleControlBackspace = () => {
        setEmployeeId('');
    };

    const handleLogin = async () => {
        if (!employeeId) {
            setError('Employee ID is required to clock in.', setErrorMessage, setCountdown);
            return;
        }

        if (shiftId) {
            setError('You are already clocked in.', setErrorMessage, setCountdown);
            return;
        }

        const response = await handleAction('clockIn', { employeeId: 'e' + employeeId }, (message) => setError(message, setErrorMessage, setCountdown));
        if (response && response.success) {
            setShiftId(response.shift._id); // Assuming the response contains the shift ID
            setEmployeeId(''); // Clear the input field
            setSuccessMessage('Successfully clocked in.');
        }
    };

    const handleLogout = async () => {
        if (!employeeId) {
            setError('Employee ID is required to clock out.', setErrorMessage, setCountdown);
            return;
        }

        if (!shiftId) {
            setError('You must be clocked in to clock out.', setErrorMessage, setCountdown);
            return;
        }

        if (isBreakActive) {
            setError('You must end your break before clocking out.', setErrorMessage, setCountdown);
            return;
        }

        await handleAction('clockOut', { shiftId }, (message) => setError(message, setErrorMessage, setCountdown));
        setShiftId(''); // Clear shiftId after clocking out
        setEmployeeId(''); // Clear the input field
        setSuccessMessage('Successfully clocked out.');
    };

    const handleBreak = async () => {
        if (!employeeId) {
            setError('Employee ID is required to start or end a break.', setErrorMessage, setCountdown);
            return;
        }

        if (!shiftId) {
            setError('You must be clocked in to start or end a break.', setErrorMessage, setCountdown);
            return;
        }

        if (isBreakActive) {
            const response = await handleAction('endBreak', { breakId }, (message) => setError(message, setErrorMessage, setCountdown));
            if (response && response.success) {
                setIsBreakActive(false);
                setBreakId('');
                setEmployeeId(''); // Clear the input field
                setSuccessMessage('Successfully ended break.');
            }
        } else {
            const response = await handleAction('startBreak', { employeeId: 'e' + employeeId, shiftId }, (message) => setError(message, setErrorMessage, setCountdown));
            if (response && response.success) {
                setIsBreakActive(true);
                setBreakId(response.breakEntry._id); // Assuming the response contains the break ID
                setEmployeeId(''); // Clear the input field
                setSuccessMessage('Successfully started break.');
            }
        }
    };

    return (
        <div className='flex flex-col h-[100vh]'>
            <TopNavBar showSearch={false} />
            ={false}
            <div className="flex flex-col items-center justify-center h-full ">
                <AnimatePresence>
                    {errorMessage && (
                        <ErrorMessage key="error" message={errorMessage} countdown={countdown} />
                    )}
                    {successMessage && (
                        <ErrorMessage key="success" message={successMessage} countdown={countdown} />
                    )}
                </AnimatePresence>
                <form>
                    <input
                        type="text"
                        value={employeeId}
                        onChange={handleChange}
                        placeholder="Enter Employee ID"
                        inputMode="numeric"
                        className="flex w-full h-[150px] p-[25px] justify-center items-center shrink-0 rounded-[18px] outline-0 text-right shadow-md text-[25px] mb-[25px]"
                    />
                    <NumberPad
                        onNumberClick={handleNumberClick}
                        onBackspace={handleBackspace}
                        onControlBackspace={handleControlBackspace}
                    />
                </form>
                <ControlBar onLogin={handleLogin} onLogout={handleLogout} onBreak={handleBreak} isBreakActive={isBreakActive} />
            </div>
        </div>
    );
};
export default Login;
