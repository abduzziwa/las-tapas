import React from "react";

interface Props {
  text: string;
  color: string;
  onClick: () => void;
  isLoading: boolean;
}

const Button: React.FC<Props> = ({ text, color, onClick, isLoading }) => {
  return (
    <button
      className="font-bold text-[35px] py-[10px] px-[50px] rounded-[12px]"
      style={{ background: color, opacity: isLoading ? 0.5 : 1 }}
      onClick={onClick}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : text}
    </button>
  );
};

export default Button;
