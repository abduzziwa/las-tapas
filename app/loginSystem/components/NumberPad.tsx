import React from 'react';
import { motion } from 'framer-motion';
import backspaceIcon from '../../../public/backspace.svg';
import controlIcon from '../../../public/ctrl-backspace.svg';

interface NumberPadProps {
    onNumberClick: (number: string) => void;
    onBackspace: () => void;
    onControlBackspace: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onNumberClick, onBackspace, onControlBackspace }) => (
    <div className="grid grid-cols-3 gap-[25px] max-w-[350px] content-center place-items-center select-none">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <motion.button
                key={num}
                type="button"
                onClick={() => onNumberClick(num.toString())}
                className="h-[100px] w-[100px] rounded-[18px] leading-[100px] text-black text-[50px] text-center flex justify-center items-center shadow-md hover:bg-[#F95E07] p-[10px] hover:text-white hover:shadow-[inset_4px_4px_4px_rgba(0,0,0,0.25)]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                {num}
            </motion.button>
        ))}
        <motion.button
            type="button"
            onClick={onBackspace}
            className="h-[100px] w-[100px] rounded-[18px] leading-[100px] flex justify-center items-center shadow-md hover:bg-[#F95E07] p-[10px] hover:shadow-[inset_4px_4px_4px_rgba(0,0,0,0.25)] group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <img src={backspaceIcon.src} alt="Backspace" draggable="false" className="w-[40px] h-[40px] group-hover:invert" />
        </motion.button>
        <motion.button
            type="button"
            onClick={onControlBackspace}
            className="h-[100px] w-[100px] rounded-[18px] leading-[100px] flex justify-center items-center shadow-md hover:bg-[#F95E07] p-[10px] hover:shadow-[inset_4px_4px_4px_rgba(0,0,0,0.25)] group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <img src={controlIcon.src} alt="Control Backspace" draggable="false" className="w-[40px] h-[40px] group-hover:invert" />
        </motion.button>
    </div>
);

export default NumberPad;
