import React from "react";
import Image from "next/image";
import logoutIcon from "../../../public/logout.svg";
import breakIcon from "../../../public/break.svg";
import loginIcon from "../../../public/login.svg";

interface ControlBarProps {
  onLogin: () => void;
  onLogout: () => void;
  onBreak: () => void;
  isBreakActive: boolean; // Add a prop to indicate break status
}

const ControlBar: React.FC<ControlBarProps> = ({
  onLogin,
  onLogout,
  onBreak,
  isBreakActive,
}) => {
  return (
    <div className="flex w-[350px] h-[50px] rounded-[18px] text-white shadow-md select-none bg-custom-gradient justify-between items-center px-[10px] mt-[25px]">
      <div onClick={onLogout}>
        <Image
          src={logoutIcon}
          alt="Logout"
          width={30}
          height={30}
          draggable="false"
        />
      </div>
      <div onClick={onBreak}>
        <Image
          src={breakIcon}
          alt="Break"
          width={30}
          height={30}
          draggable="false"
        />
      </div>
      <div onClick={onLogin}>
        <Image
          src={loginIcon}
          alt="Login"
          width={30}
          height={30}
          draggable="false"
        />
      </div>
    </div>
  );
};

export default ControlBar;
