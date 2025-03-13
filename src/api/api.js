import OpenAI from "openai";

const API_BASE_URL = '/api'; // 백엔드 API 기본 URL

// 초기 대시보드 데이터 가져오기 (세션 정보, JMX 주소 등)
export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/initialData`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('데이터 가져오기 실패:', error);
    throw error;
  }
};

// 대시보드 레이아웃 저장
export const saveDashboardLayout = async (layout) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/layout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(layout),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('레이아웃 저장 실패:', error);
    throw error;
  }
};

export const fetchOpenAIResponse = async (query) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API 키가 설정되지 않았습니다!");
    return { error: "API 키가 누락되었습니다." };
  }
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
          {
              role: "user",
              content: query,
          },
      ],
    });

    return { answer: completion.choices[0].message.content };
  } catch (err) {
    console.error("OpenAI 요청 오류: ", err);
    return { error: err.message };
  }
};
