import React from "react";
import direaLogo from "./assets/logo-direa.png";
import userIcon from "./assets/user-icon.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const TitleBar = () => {
  const navigate = useNavigate();
  return (
    <header className="w-full flex justify-between items-center px-6 py-2 bg-white border-b shadow-sm">
      {/* 사용자 정보 */}
      <div className="flex items-center gap-4">
        <img src={userIcon} className="w-10 h-10 rounded-full border border-gray-300 shadow-sm" alt="user" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 font-semibold">유저 이름</span>
          <Button
            className="rounded-full bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 h-auto flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <img
          src={direaLogo}
          className="logo w-36 cursor-pointer transition hover:opacity-90"
          alt="DIREA Logo"
          onClick={() => navigate("/")}
        />
        <span className="text-xs text-cyan-500 font-light tracking-wide mt-1">DIREA</span>
      </div>

      {/* 빈 공간 */}
      <div className="w-12"></div>
    </header>
  );
};

export default TitleBar;
