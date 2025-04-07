// src/components/WeatherIcon.jsx

import clearDay from '@/assets/icons/weather/clear-day.svg?react';
import clearNight from '@/assets/icons/weather/clear-night.svg?react';
import cloudDown from '@/assets/icons/weather/cloud-down.svg?react';
import cloudUp from '@/assets/icons/weather/cloud-up.svg?react';
import cloudy from '@/assets/icons/weather/cloudy.svg?react';
import drizzle from '@/assets/icons/weather/drizzle.svg?react';
import extreme from '@/assets/icons/weather/extreme.svg?react';
import hail from '@/assets/icons/weather/hail.svg?react';
import haze from '@/assets/icons/weather/haze.svg?react';
import hazeDay from '@/assets/icons/weather/haze-day.svg?react';
import hazeNight from '@/assets/icons/weather/haze-night.svg?react';
import horizon from '@/assets/icons/weather/horizon.svg?react';
import lightningBolt from '@/assets/icons/weather/lightning-bolt.svg?react';
import mist from '@/assets/icons/weather/mist.svg?react';
import rain from '@/assets/icons/weather/rain.svg?react';
import sleet from '@/assets/icons/weather/sleet.svg?react';
import snow from '@/assets/icons/weather/snow.svg?react';
import tornado from '@/assets/icons/weather/tornado.svg?react';
import wind from '@/assets/icons/weather/wind.svg?react';
import windSnow from '@/assets/icons/weather/wind-snow.svg?react';
import partlyCloudyDay from '@/assets/icons/weather/partly-cloudy-day.svg?react';
import partlyCloudyNight from '@/assets/icons/weather/partly-cloudy-night.svg?react';
import partlyCloudyDayRain from '@/assets/icons/weather/partly-cloudy-day-rain.svg?react';
import partlyCloudyNightRain from '@/assets/icons/weather/partly-cloudy-night-rain.svg?react';
import partlyCloudyDaySnow from '@/assets/icons/weather/partly-cloudy-day-snow.svg?react';
import partlyCloudyNightSnow from '@/assets/icons/weather/partly-cloudy-night-snow.svg?react';
import thunderstorms from '@/assets/icons/weather/thunderstorms.svg?react';

const codeMapping = {
  // 기본적인 날씨 코드 기준 (OpenWeather 등)
  '01d': clearDay,
  '01n': clearNight,
  '02d': partlyCloudyDay,
  '02n': partlyCloudyNight,
  '03d': cloudy,
  '03n': cloudy,
  '04d': cloudUp,
  '04n': cloudDown,

  '09d': rain,
  '09n': rain,
  '10d': partlyCloudyDayRain,
  '10n': partlyCloudyNightRain,
  '11d': thunderstorms,
  '11n': lightningBolt,

  '13d': snow,
  '13n': snow,
  '50d': mist,
  '50n': mist,

  // 보조적인 매핑 (직접 사용할 경우)
  drizzle: drizzle,
  sleet: sleet,
  snow: snow,
  hail: hail,
  haze: haze,
  hazeDay: hazeDay,
  hazeNight: hazeNight,
  horizon: horizon,
  extreme: extreme,
  tornado: tornado,
  wind: wind,
  windSnow: windSnow,
  partlyCloudyDaySnow: partlyCloudyDaySnow,
  partlyCloudyNightSnow: partlyCloudyNightSnow,
};

const WeatherIcon = ({ code = '01d', size = 50, alt = '날씨 아이콘' }) => {
  const Icon = codeMapping[code] || cloudy; // fallback
  return <Icon width={size} height={size} alt={alt} />;
};

export default WeatherIcon;