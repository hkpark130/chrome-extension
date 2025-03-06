// api/api.js
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

// 코드 데이터 가져오기
export const getCode = async (codeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/code/${codeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('코드 데이터 가져오기 실패:', error);
    throw error;
  }
};