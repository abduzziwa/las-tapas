//

// Button.tsx
import React from "react";

interface Props {
  text: string;
  color: string;
  onClick: () => void;
  disabled: boolean;
}

const Button: React.FC<Props> = ({ text, color, onClick, disabled }) => {
  return (
    <button
      className="font-bold text-[35px] py-[10px] px-[50px] rounded-[12px]"
      style={{ background: color, opacity: disabled ? 0.5 : 1 }}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
