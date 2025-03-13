import React, { useState } from "react";
import direaLogo from "@/assets/logo-direa.png";
import userIcon from "@/assets/user-icon.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";

const TitleBar = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  const handleAuthAction = () => {
    if (isLogin) {
      alert("로그아웃 되었습니다.");  // ✅ 로그아웃 클릭 시
      setIsLogin(false);
    } else {
      alert("로그인 페이지로 이동합니다.");  // ✅ 로그인 클릭 시
      setIsLogin(true);
    }
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-1 bg-white border-b shadow-sm">
      {/* 사용자 정보 */}
      <div className="flex items-center gap-4">
        <img src={userIcon} className="w-10 h-10 rounded-full border border-gray-300 shadow-sm" alt="user" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 font-semibold">
            {isLogin ? "유저 이름" : "로그인이 필요합니다"}
          </span>

          <Button
            onClick={handleAuthAction}
            className={`rounded-full border-[2px] px-3 py-1 h-auto flex transition ${
              isLogin 
                ? "border-red-500 text-white bg-red-500 hover:bg-red-600"
                : "border-blue-500 text-white bg-blue-500 hover:bg-blue-600"
            }`}
            style={{ fontFamily: "'Gamja Flower', sans-serif", fontSize: "1.1rem" }}
          >
            {isLogin 
              ? <LogOut className="w-4 h-4 mr-1" /> 
              : <LogIn className="w-4 h-4 mr-1" />}
            {isLogin ? "로그아웃" : "로그인"}
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
      </div>

      {/* 빈 공간 */}
      <div className="w-12"></div>
    </header>
  );
};

export default TitleBar;
