'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ConfirmationModal: React.FC<Props> = ({
  isOpen, onClose, onConfirm,
  title   = 'Confirm Order',
  message = 'Ready to send your order to the kitchen?',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 px-4 pb-6 sm:pb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl"
                style={{ background: '#FEF3EB' }}>
                🍽️
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{title}</h2>
              <p className="text-gray-500 text-sm">{message}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-gray-600 bg-gray-100 active:bg-gray-200 transition-colors"
              >
                Not yet
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg,#F95E07,#DB8555)' }}
              >
                Yes, order!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
