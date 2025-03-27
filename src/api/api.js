import axios from "axios";
import OpenAI from "openai";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.44:8000";

// ✅ Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

export const setAccessToken = async (token) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.withCredentials = true;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

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

export const getDashboard = async (accessToken, userId) => {
  if (!userId) {
    console.error("오류: userId가 없습니다.");
    throw new Error("userId가 제공되지 않았습니다.");
  }

  try {
    const response = await axiosInstance.get("/dashboard/"+userId, {
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

const saveToDatabase = async (updatedItems, updatedLayout) => {
  const dashboardData = {
    userId: "550e8400-e29b-41d4-a716-446655440000", // 실제 로그인된 사용자의 UUID 필요
    widgets: updatedLayout.map(item => ({
      position: {
        x: item.x,
        y: item.y,
        width: item.w,
        height: item.h,
      },
      style: {
        isBordered: item.isBordered,
        component: item.component
      }
    }))
  };

  try {
    const response = await fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dashboardData)
    });

    if (response.ok) {
      alert("✅ 대시보드가 저장되었습니다!");
    } else {
      throw new Error("Failed to save");
    }
  } catch (error) {
    console.error("Error saving dashboard:", error);
  }
};

// ✅ 🔹 북마크 테스트 API 요청
// export const test = async (accessToken) => {
//     try {
//       const response = await axiosInstance.get("/bookmarks/1", {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       console.error("실패: ", error);
//       throw error;
//     }
// };