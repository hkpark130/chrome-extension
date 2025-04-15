const KEYCLOAK_URL = "https://keycloak.direa.synology.me"; // Keycloak 주소
const REALM = "sso"; // Keycloak Realm
const CLIENT_ID = "chrome-ext"; // Keycloak Client ID

const REDIRECT_URI = chrome.identity.getRedirectURL();
const TOKEN_ENDPOINT = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html")
  });
});

// 메인 리스너 - App/TitleBar 등에서 보낸 메시지 처리
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.executeFn === "signIn") {
    startLogin().then(sendResponse).catch((e) => {
      console.error("Login error", e);
      sendResponse(null);
    });
    return true;
  } else if (request.executeFn === "signOut") {
    startLogout().then(sendResponse).catch((e) => {
      console.error("Logout error", e);
      sendResponse(null);
    });
    return true;
  } else if (request.executeFn === "getSignedInUser") {
    chrome.storage.local.get(["user"], (result) => {
      sendResponse(result.user || null);
    });
    return true;
  } else if (request.executeFn === "silentLogin") {
    performSilentLogin().then(sendResponse).catch((e) => {
      console.error("Silent login error", e);
      sendResponse(null);
    });
    return true;
  }
});

async function startLogin() {
  const authUrl =
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=openid profile email`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (responseUrl) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }

        if (!responseUrl) return reject("No responseUrl returned.");

        const url = new URL(responseUrl);
        const code = url.searchParams.get("code");
        if (!code) return reject("No code found in response.");

        try {
          const tokenResponse = await exchangeCodeForToken(code);
          const userInfo = await getUserInfo(tokenResponse.access_token);

          const user = {
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            idToken: tokenResponse.id_token,
            expiresIn: tokenResponse.expires_in,
            profile: userInfo,
          };

          await chrome.storage.local.set({ user });
          resolve(user);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

async function exchangeCodeForToken(code) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error("Token exchange failed");
  }

  return await response.json();
}

async function getUserInfo(accessToken) {
  const response = await fetch(
    `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!response.ok) {
    throw new Error("UserInfo request failed");
  }
  return await response.json();
}

async function startLogout() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["user"], async (result) => {
      const user = result.user;

      if (!user || !user.idToken) {
        console.error("No idToken available for logout");
        resolve({ success: false });
        return;
      }

      // 리디렉션 URI는 확장 전용으로 설정해야 함
      const postLogoutRedirectUri = chrome.identity.getRedirectURL();

      const logoutUrl = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout?` +
        `id_token_hint=${encodeURIComponent(user.idToken)}` +
        `&post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;

      try {
        chrome.identity.launchWebAuthFlow({
          url: logoutUrl,
          interactive: false
        }, async (responseUrl) => {
          if (chrome.runtime.lastError) {
            console.error("Logout flow error:", chrome.runtime.lastError);
            resolve({ success: false });
            return;
          }

          // 로그아웃까지 완료되었으므로 사용자 정보 제거
          await chrome.storage.local.remove(["user"]);
          window.location.reload();
          resolve({ success: true });
        });
      } catch (err) {
        console.error("Unexpected error during logout:", err);
        resolve({ success: false });
      }
    });
  });
}

async function refreshTokens(refreshToken) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  return await response.json();
}

async function performSilentLogin() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["user"], async (result) => {
      const user = result.user;

      if (!user || !user.refreshToken) {
        resolve(null);
        return;
      }

      try {
        const refreshed = await refreshTokens(user.refreshToken);

        const updatedUser = {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token || user.refreshToken,
          idToken: refreshed.id_token || user.idToken,
          expiresIn: refreshed.expires_in,
          profile: user.profile
        };

        await chrome.storage.local.set({ user: updatedUser });

        resolve(updatedUser);
      } catch (err) {
        console.error("Token refresh failed", err);
        await chrome.storage.local.remove(["user"]);
        resolve(null);
      }
    });
  });
}