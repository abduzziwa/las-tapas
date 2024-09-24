import React, { useState } from "react";
interface Props {
  text: string;
  color: string;
  onClick: () => void;
  isLoading: boolean;
  disable?: boolean;
}

const WaiterButton: React.FC<Props> = ({
  text,
  color,
  onClick,
  isLoading,
  disable,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleConfirm = () => {
    onClick();
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        className="font-bold text-[35px] py-[10px] px-[10px] rounded-[12px]"
        style={{ background: color, opacity: isLoading ? 0.5 : 1 }}
        onClick={() => setIsOpen(true)}
        disabled={isLoading || disable}
      >
        {isLoading ? "Loading..." : text}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirmation</h2>
            <p className="mb-6">Are you sure you want to {text}?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={handleCancel}
                // disabled
              >
                No
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleConfirm}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WaiterButton;
