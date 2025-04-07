import React, { useEffect, useState, useRef } from "react";
import direaLogo from "@/assets/logo-direa.png";
import userIcon from "@/assets/user-icon.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Weather from "@/components/Weather";
import { LogOut, LogIn, Settings } from "lucide-react";
import { useAuth, hasAuthParams } from "react-oidc-context";
import { setApiAccessToken } from "@/api/api.js";

const TitleBar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const initalialAccessToken = auth.user?.access_token ?? '';
  const accessTokenRef = useRef(initalialAccessToken);
  const [hasTriedSignin, setHasTriedSignin] = useState(false);

  useEffect(() => {
    const newToken = auth.user?.access_token ?? "";
    if (accessTokenRef.current !== newToken) {
      setApiAccessToken(newToken);
      accessTokenRef.current = newToken;
    }
  }, [auth.user?.access_token]);

  useEffect(() => {
    if (
      !hasAuthParams() && // OIDC 인증 파라미터가 없고
      !auth.isAuthenticated && // 인증되지 않은 상태
      !auth.activeNavigator && // 현재 로그인 시도 중이 아니라면
      !auth.isLoading && // 로딩 중이 아니고
      !hasTriedSignin // 아직 Silent Authentication 시도 안 했을 때
    ) {
      auth.signinSilent()
        .then(() => console.log("✅ Silent 로그인 성공!"));
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);

  const handleAuthAction = () => {
    if (auth.isAuthenticated) {
      auth.signoutRedirect();
    } else {
      auth.signinRedirect();
    }
  };

  return (
    <header className="w-full flex justify-between items-center px-6 py-1 bg-white border-b shadow-sm">
      {/* 사용자 정보 */}
      <div className="flex items-center gap-4">
        <img src={userIcon} className="w-10 h-10 rounded-full border border-gray-300 shadow-sm" alt="user" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 font-semibold">
            {auth.isAuthenticated ? auth.user?.profile?.name || "로그인 사용자" : "로그인이 필요합니다"}
          </span>

          <Button
            onClick={handleAuthAction}
            className={`rounded-full border-[2px] px-3 py-1 h-auto flex transition ${
              auth.isAuthenticated 
                ? "border-red-500 text-white bg-red-500 hover:bg-red-600"
                : "border-blue-500 text-white bg-blue-500 hover:bg-blue-600"
            }`}
            style={{ fontFamily: "'Gamja Flower', sans-serif", fontSize: "1.1rem" }}
          >
            {auth.isAuthenticated 
              ? <LogOut className="w-4 h-4 mr-1" /> 
              : <LogIn className="w-4 h-4 mr-1" />}
            {auth.isAuthenticated ? "로그아웃" : "로그인"}
          </Button>

          {/* <Button onClick={handleTest}>{"테스트"}</Button> */}
        </div>
      </div>

      {/* ⬅️ Weather: 왼쪽 정렬 */}
      <div className="flex-col flex-[0_0_40%]">
        <Weather />
      </div>

      {/* 🎯 로고: 중앙 정렬 */}
      <div className="flex-col flex-[0_0_40%]">
        <img
          src={direaLogo}
          className="logo w-36 cursor-pointer transition hover:opacity-90"
          alt="DIREA Logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 빈 영역 */}
      <div className="flex flex-col w-12">
        <div className="flex flex-col items-center">
          <Button onClick={() => navigate("/edit")} 
            style={{ fontFamily: "'Gamja Flower', sans-serif", fontSize: "1.27rem" }}
            className="border-[2px] border-cyan-500 text-cyan-600 py-2 px-4 rounded-full shadow-md 
                  bg-white hover:bg-cyan-50 transition">
            <Settings className="w-4 h-4" />
            편집
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TitleBar;
