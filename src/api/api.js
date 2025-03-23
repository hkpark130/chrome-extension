import axios from "axios";
import OpenAI from "openai";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.72:8000";

// ✅ Axios 인스턴스 생성 (모든 API 요청에 쿠키 포함)
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ 401 응답 처리: Keycloak 로그인 페이지로 리디렉트
axiosInstance.interceptors.response.use(
    response => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;


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
export const test = async (accessToken) => {
    try {
      const response = await axiosInstance.get("/bookmarks/1", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("실패: ", error);
      throw error;
    }
};