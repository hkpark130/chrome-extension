import React, { useEffect, useState, useRef } from "react";
import direaLogo from "@/assets/logo-direa.png";
import userIcon from "@/assets/user-icon.png";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Settings } from "lucide-react";
import { test } from "@/api/api.js";
import { useAuth } from "react-oidc-context";
import { userManager } from "@/auth/oidcConfig"; // 직접 불러온 UserManager


const TitleBar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const initalialAccessToken = auth.user?.access_token ?? '';
  const [accessToken, setAccessToken] = useState(initalialAccessToken);
  const accessTokenRef = useRef(initalialAccessToken);

  useEffect(() => {
    const newToken = auth.user?.access_token ?? '';
    if (accessTokenRef.current !== newToken) {
      setAccessToken(newToken);
      accessTokenRef.current = newToken;

      console.debug('Renewed access token: ' + auth.user?.access_token);
    }
  }, [auth.user?.access_token]);

//   https://www.npmjs.com/package/react-oidc-context
//   useEffect(() => {
//     if (!hasAuthParams() &&
//         !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading &&
//         !hasTriedSignin
//     ) {
//         auth.signinRedirect();
//         setHasTriedSignin(true);
//     }
// }, [auth, hasTriedSignin]);

  const handleAuthAction = () => {
    if (auth.isAuthenticated) {
      auth.signoutRedirect();
    } else {
      auth.signinRedirect();
    }
  };

  const handleTest = async () => {
    try {
      const res = await test(auth.user?.access_token); // 토큰 전달 시 참고
      console.log("res: ", res);
    } catch (err) {
      console.error("API 호출 에러: ", err);
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

      {/* 로고 */}
      <div className="flex flex-col items-center">
        <img
          src={direaLogo}
          className="logo w-36 cursor-pointer transition hover:opacity-90"
          alt="DIREA Logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 빈 영역 */}
      <div className="flex flex-col w-12">
        <Button onClick={() => navigate("/edit")} 
          style={{ fontFamily: "'Gamja Flower', sans-serif", fontSize: "1.27rem" }}
          className="absolute top-2 right-2 border-[2px] border-cyan-500 text-cyan-600 py-2 px-4 rounded-full shadow-md 
                bg-white hover:bg-cyan-50 transition">
          <Settings className="w-4 h-4" />
          편집
        </Button>
      </div>
    </header>
  );
};

export default TitleBar;
