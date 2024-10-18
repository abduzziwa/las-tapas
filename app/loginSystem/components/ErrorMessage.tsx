import React from 'react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
    message: string;
    countdown: number;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, countdown }) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-[90px] flex flex-col w-auto h-[100px] p-[25px] justify-between items-start rounded-[18px] shadow-md bg-custom-gradient"
    >
        <span>{message}</span>
        <span className='select-none'>This message is disappearing in {countdown} seconds.</span>
    </motion.div>
);

export default ErrorMessage;
