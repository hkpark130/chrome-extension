import React, { useEffect, useState } from 'react';
import { fetchWeather } from "@/api/api";
import 'meteocons/style.css'; // meteocons CSS 추가

const Weather = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      const data = await fetchWeather();
      setWeather(data);
    } catch (error) {
      console.error("날씨 정보를 불러오는 데 실패했습니다.", error);
    }
  };

  if (!weather) {
    return <div>날씨 정보를 불러오는 중...</div>;
  }

  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-md space-x-4">
      {/* 아이콘 */}
      <i className={`${weather.iconClass} text-4xl`} />

      {/* 온도, 상태, 위치 */}
      <div className="flex flex-col">
        <div className="text-xl font-bold">{weather.temperature}°C</div>
        <div className="text-sm text-gray-600">{weather.condition}</div>
        <div className="text-xs text-gray-500">{weather.location}</div>
      </div>
    </div>
  );
};

export default Weather;
