import React, { useState, useEffect } from "react";
import direaLogo from "@/assets/logo-direa.png";
import userIcon from "@/assets/user-icon.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { test } from "@/api/api.js";

const TitleBar = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    // 로그인 여부 확인 (httpOnly 쿠키는 JS에서 직접 읽을 수 없으므로 localStorage 사용)
    setIsLogin(localStorage.getItem("isLogin") === "true");
  }, []);

  const handleAuthAction = () => {
    if (isLogin) {
      alert("로그아웃 되었습니다.");
      localStorage.removeItem("isLogin");
      navigate("/");
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsLogin(false);
    } else {
      // ✅ 로그인 버튼 클릭 시 Keycloak 로그인 페이지로 이동
      window.location.href = "http://192.168.2.59:8080/realms/sso/protocol/openid-connect/auth"
          + "?client_id=chrome-ext"
          + "&response_type=code"
          + "&scope=openid"
          + "&redirect_uri=http://192.168.2.47:5173/callback";
    }
  };

  const handleTest = async () => {
    try {
      const res = await test();
      console.log("res: ", res);
    } catch (err) {
      console.log("에러뜸: ", err);
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

          <Button
            onClick={handleTest}
          >
            {"테스트"}
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
