// src/context/UserProviderExtension.jsx
import React, { useState, useEffect, createContext, useRef, useContext } from "react";
import { setApiAccessToken } from "@/api/api";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const refreshTimer = useRef(null);

  const isLoggedIn = !!user; // ✅ 로그인 여부 체크

  const scheduleTokenRefresh = (expiresInSeconds) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);

    const refreshTime = (expiresInSeconds - 60) * 1000;
    refreshTimer.current = setTimeout(() => {
      console.log("크롬용 silent 로그인 시도")
      chrome.runtime.sendMessage({ executeFn: "silentLogin" }, (refreshedUser) => {
        if (refreshedUser && refreshedUser.profile) {
          setUser(refreshedUser);
          setApiAccessToken(refreshedUser.accessToken);
          scheduleTokenRefresh(refreshedUser.expiresIn);
        } else {
          setUser(null);
          setApiAccessToken(null);
        }
      });
    }, refreshTime);
  };

  useEffect(() => {
    chrome.runtime.sendMessage({ executeFn: "getSignedInUser" }, (storedUser) => {
      if (storedUser && storedUser.profile) {
        setUser(storedUser);
        setApiAccessToken(storedUser.accessToken);
        scheduleTokenRefresh(storedUser.expiresIn);
      }
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes.user) {
        const newUser = changes.user.newValue;
        setUser(newUser || null);
        setApiAccessToken(newUser?.accessToken ?? null);
      }
    });

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};