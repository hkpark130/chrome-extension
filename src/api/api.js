import axios from "axios";
import OpenAI from "openai";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.44:8000";

let accessToken = null;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setApiAccessToken = (token) => {
  accessToken = token;
};

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

export const saveDashboard = async (userId, updatedLayout) => {
  if (!userId) {
    console.error("오류: userId 가 없습니다.");
    throw new Error("userId 가 제공되지 않았습니다.");
  }
  
  const payload = updatedLayout.map((item) => ({
    id: item.i,
    position: {
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    },
    style: {
      component: item.component,
      isBordered: item.isBordered,
    },
  }));

  try {
    await axiosInstance.put(`/dashboard/${userId}/widgets`, payload);
  } catch (error) {
    console.error("Error saving dashboard:", error);
  }
};

export const loadDashboard = async (userId) => {

  try {
    // const response = await axiosInstance.get(`/dashboard/${userId}/${dashboardId}`);
    const response = await axiosInstance.get(`/dashboard/${userId}`);
    const widgets = response.data.widgets;

    return widgets.map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
      component: widget.style.component,
      isBordered: widget.style.isBordered,
      minW: 1,
      minH: 2,
      resizeHandles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
    }));
  } catch (error) {
    console.error("❌ 대시보드 로드 실패:", error);
    return [];
  }
};

export const loadMeeting = async () => {
  try {
    const response = await axiosInstance.get(`/workspace/meeting`);
    return response.data.map(event => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  } catch (error) {
    console.error("Failed to fetch events:", error);
  }
};

export const deleteMeeting = async (url) => {
  try {
    const response = await axiosInstance.delete(`/workspace/meeting/${url}`);
    return response.data.data;
  } catch (error) {
    console.error("Failed to delete events:", error);
  }
};

export const saveMeeting = async (meetingRequest) => {
  try {
    console.log("meetingRequest: ", meetingRequest);
    const response = await axiosInstance.post(`/workspace/meeting`, meetingRequest);
    return response.data; // 저장된 예약 리스트 반환 (반복 포함 가능)
  } catch (error) {
    console.error("❌ 회의 예약 저장 실패:", error);
    throw error; // 상위에서 try-catch 할 수 있도록 re-throw
  }
};
