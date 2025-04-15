// TitleBar.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import direaLogo from "@/assets/logo-direa.png";
import userIcon from "@/assets/user-icon.png";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, Settings } from "lucide-react";
import Weather from "@/components/Weather";
import { isChromeExtension } from "@/api/utils";
import { setApiAccessToken } from "@/api/api";

// 두 환경의 인증 훅
import { useUser as useExtensionUser } from "@/context/UserProvider";
import { useAuth } from "react-oidc-context"; // Dev 환경 전용

const TitleBar = () => {
  const navigate = useNavigate();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);

  // ✅ 유저 상태 훅 → 환경에 따라 분기
  const { user, setUser, isLoggedIn } = isChromeExtension()
  ? useExtensionUser()
  : {
      user: useAuth().user,
      setUser: () => {},
      isLoggedIn: useAuth().isAuthenticated,
    };

  // ✅ 개발 환경 전용: accessToken 설정 및 silent login
  const auth = !isChromeExtension() ? useAuth() : null;
  const accessTokenRef = useRef(auth?.user?.access_token ?? "");

  useEffect(() => {
    if (!isChromeExtension() && auth?.user?.access_token) {
      const newToken = auth.user.access_token;
      if (accessTokenRef.current !== newToken) {
        setApiAccessToken(newToken);
        accessTokenRef.current = newToken;
      }
    }
  }, [auth?.user?.access_token]);

  useEffect(() => {
    if (!isChromeExtension() && !auth.isAuthenticated && !auth.isLoading && !hasTriedSignin) {
      if (!auth.activeNavigator) {
        auth.signinSilent().then(() =>
          console.log("✅ 개발용 silent 로그인 성공")
        );
        setHasTriedSignin(true);
      }
    }
  }, [auth, hasTriedSignin]);

  // ✅ 공통 UI용 핸들러 → 내부 동작만 분기
  const handleAuthAction = () => {
    if (isChromeExtension()) {
      // 크롬 확장 앱용 login/logout
      if (user) {
        chrome.runtime.sendMessage({ executeFn: "signOut" }, (res) => {
          if (res?.success) setUser(null);
        });
      } else {
        chrome.runtime.sendMessage({ executeFn: "signIn" }, (res) => {
          if (res && res.profile) setUser(res);
        });
      }
    } else {
      // 로컬개발 서버용 login/logout
      if (auth.isAuthenticated) {
        auth.signoutRedirect(); 
      } else {
        auth.signinRedirect();
      }
    }
  };

  // ✅ name 표시 - 확장/개발 공통
  const userName =
    isChromeExtension()
      ? user?.profile?.name
      : auth?.isAuthenticated
        ? auth.user?.profile?.name
        : null;

  return (
    <header className="w-full flex justify-between items-center px-6 py-1 bg-white border-b shadow-sm">
      {/* 사용자 정보 */}
      <div className="flex items-center gap-4">
        <img
          src={userIcon}
          className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
          alt="user"
        />
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 font-semibold">
            {userName || "로그인이 필요합니다"}
          </span>
          <Button
            onClick={handleAuthAction}
            className={`rounded-full border-[2px] px-3 py-1 h-auto flex transition ${
              isLoggedIn
                ? "border-red-500 text-white bg-red-500 hover:bg-red-600"
                : "border-blue-500 text-white bg-blue-500 hover:bg-blue-600"
            }`}
            style={{
              fontFamily: "'Gamja Flower', sans-serif",
              fontSize: "1.1rem",
            }}
          >
            {isLoggedIn ? (
              <LogOut className="w-4 h-4 mr-1" />
            ) : (
              <LogIn className="w-4 h-4 mr-1" />
            )}
            {isLoggedIn ? "로그아웃" : "로그인"}
          </Button>
        </div>
      </div>

      {/* 날씨 */}
      <div className="flex-col flex-[0_0_40%]">
        <Weather />
      </div>

      {/* 로고 클릭 */}
      <div className="flex-col flex-[0_0_40%]">
        <img
          src={direaLogo}
          className="logo w-36 cursor-pointer transition hover:opacity-90"
          alt="DIREA Logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* 편집 버튼 */}
      <div className="flex flex-col w-12">
        <div className="flex flex-col items-center">
          <Button
            onClick={() => navigate("/edit")}
            style={{
              fontFamily: "'Gamja Flower', sans-serif",
              fontSize: "1.27rem",
            }}
            className="border-[2px] border-cyan-500 text-cyan-600 py-2 px-4 rounded-full shadow-md bg-white hover:bg-cyan-50 transition"
          >
            <Settings className="w-4 h-4" />
            편집
          </Button>
        </div>
      </div>
    </header>
  );
};

export default TitleBar;