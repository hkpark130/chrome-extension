import axios from "axios";
import OpenAI from "openai";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.72:8000";
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "https://keycloak.direa.synology.me";
const REALM = "sso"; 
const CLIENT_ID = "chrome-ext";

// ✅ Axios 인스턴스 생성 (모든 API 요청에 쿠키 포함)
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔥 httpOnly 쿠키 기반 인증 활성화
});

// ✅ 401 응답 처리: Keycloak 로그인 페이지로 리디렉트
axiosInstance.interceptors.response.use(
    response => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // 🚨 401 Unauthorized → Keycloak 로그인 페이지로 이동
            window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`
                + `?client_id=${CLIENT_ID}`
                + "&response_type=code"
                + "&scope=openid"
                + `&redirect_uri=${API_BASE_URL}/login/oauth2/code/keycloak`;
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

// ✅ 🔥 로그인 요청 (Keycloak 기본 로그인 페이지로 이동)
export const login = () => {
    window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`
        + `?client_id=${CLIENT_ID}`
        + "&response_type=code"
        + "&scope=openid"
        + `&redirect_uri=${API_BASE_URL}/login/oauth2/code/keycloak`;
};

// ✅ 🔥 로그아웃 요청
export const logout = () => {
    // 쿠키 삭제 처리
    document.cookie = "access_token=; Max-Age=0; path=/;";

    // Keycloak 로그아웃 후 리디렉트
    // window.location.href = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`
    //     + "?post_logout_redirect_uri=http://192.168.2.47:5173";
    window.location.href = `${API_BASE_URL}/logout`;
};

// ✅ 🔥 Keycloak에서 Access Token 요청 (로그인 후 실행됨)
// export const getAccessToken = async (authCode) => {
//     try {
//         const response = await axios.post(
//             `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
//             new URLSearchParams({
//                 grant_type: "authorization_code",
//                 client_id: CLIENT_ID,
//                 client_secret: CLIENT_SECRET,
//                 code: authCode,
//                 redirect_uri: "http://192.168.2.47:5173/callback"
//             }),
//             {
//                 headers: { "Content-Type": "application/x-www-form-urlencoded" },
//                 withCredentials: true // ✅ 쿠키로 토큰 저장
//             }
//         );
//         console.log("✅ 로그인 성공, JWT가 httpOnly Cookie에 저장됨!");
//         return response.data;
//     } catch (error) {
//         console.error("❌ Access Token 요청 실패:", error);
//     }
// };

// ✅ 🔹 OpenAI API 요청 (GPT 호출)
export const fetchOpenAIResponse = async (query) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        console.error("🚨 OpenAI API 키가 설정되지 않았습니다!");
        return { error: "API 키가 누락되었습니다." };
    }

    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    try {
        const completion = await client.chat.completions.create({
            model: "gpt-4o",
            max_tokens: 1024,
            messages: [{ role: "user", content: query }],
        });

        return { answer: completion.choices[0].message.content };
    } catch (err) {
        console.error("🚨 OpenAI 요청 오류: ", err);
        return { error: err.message };
    }
};

// ✅ 🔹 북마크 테스트 API 요청
export const test = async () => {
    try {
        const response = await axiosInstance.get("/bookmarks/1");
        return response.data;
    } catch (error) {
        console.error("실패: ", error);
        throw error;
    }
};