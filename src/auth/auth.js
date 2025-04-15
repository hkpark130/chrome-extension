import { isChromeExtension } from "@/api/utils";

export const login = ({ auth, setUser}) => {
  if (isChromeExtension()) {
    chrome.runtime.sendMessage({ executeFn: "signIn" }, (res) => {
      if (res?.profile) {
        setUser(res);
      } else {
        console.error("확장 로그인 실패");
      }
    });
  } else {
    auth.signinRedirect();
  }
};