import React, { useEffect, useState } from 'react';
import { fetchWeather } from "@/api/api";
import WeatherIcon from "@/components/ui/WeatherIcon";

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(getFormattedTime());

  // ⏰ 1. 현재 시간 포맷팅 함수 (24시간 기준)
  function getFormattedTime() {
    const now = new Date();
    return now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getFormattedTime());
    }, 1000); // 1분마다

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, []);

  useEffect(() => {
    // 위치 받아와서 날씨 로드
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const data = await fetchWeather(latitude, longitude);
          setWeather(data);
        } catch (err) {
          console.error("날씨 정보 조회 실패:", err);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("위치 접근 실패:", error);
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <div>날씨 정보를 불러오는 중...</div>;
  if (!weather) return <div>날씨 정보를 불러오지 못했습니다.</div>;

  return (
    <div className="flex items-start gap-2 w-full">
      {/* 아이콘 */}
      <WeatherIcon code={weather.code} alt={weather.condition} />

      {/* 텍스트 블록 (전체 우측) */}
      <div className="flex flex-col w-full">
        
        {/* 온도/시간 라인 */}
        <div className="flex gap-2 items-stretch ">
          {/* 좌측: 온도 + 상태 */}
          <div className="flex flex-col leading-none">
            <div className="text-sm font-semibold">{weather.temperature}°C</div>
            <div className="text-xs text-gray-600">{weather.condition}</div>
          </div>

          {/* 우측: 시간 (2줄 높이만큼) */}
          <div className="flex justify-center items-center h-full pl-2">
            <div className="text-2xl font-semibold text-gray-800 leading-tight">
              {time}
            </div>
          </div>
        </div>

        {/* 주소 (내용 줄 만큼 아래에 위치) */}
        <div className="text-xs text-gray-500 leading-none">
          {weather.location}
        </div>
      </div>
    </div>
  );
};

export default Weather;
