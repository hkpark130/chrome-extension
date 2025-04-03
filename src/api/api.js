import axios from "axios";

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
export const fetchOpenAIStream = async (query, onChunk) => {
  if (!query) {
    console.error("❌ 'query'가 없습니다.");
    throw new Error("query가 제공되지 않았습니다.");
  }

  try {
    const response = await axiosInstance.post(
      "/external/ai",
      { message: query },
      {
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
          ...(accessToken && {
            Authorization: `Bearer ${accessToken}`,
          }),
        },
        responseType: "stream", // axios fetch adapter를 위한 명시
        adapter: "fetch", // fetch adapter 명시
      }
    );

    const stream = response.data;
    // fetch 기반 response.data 는 ReadableStream임 → pipeThrough으로 디코딩
    const reader = stream.pipeThrough(new TextDecoderStream()).getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const lines = value.split("\n");

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const text = line.replace(/^data:\s?/, "").trim();
          if (text) {
            onChunk(text);
          }
        }
      }
    }
  } catch (error) {
    console.error("💥 SSE 스트리밍 오류:", error);
    throw error;
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
