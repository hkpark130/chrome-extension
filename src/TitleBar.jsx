import React from "react";
import direaLogo from "./assets/logo-direa.png";
import userIcon from "./assets/user-icon.png";
import { useNavigate } from "react-router-dom";

const TitleBar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md border-b border-gray-200">
      {/* 사용자 정보 */}
      <div className="flex items-center gap-4">
        <img src={userIcon} className="w-12 h-12 rounded-full" />
        <div className="flex flex-col">
          <span className="text-gray-700 font-semibold">유저 이름</span>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 로고 */}
      <img
        src={direaLogo}
        className="w-40 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* 빈 공간 */}
      <div className="w-12"></div>
    </div>
  );
};

export default TitleBar;
