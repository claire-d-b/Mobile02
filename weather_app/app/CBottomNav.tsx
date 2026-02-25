import * as React from "react";
import { BottomNavigation, Text } from "react-native-paper";
import { View } from "react-native";
import getWeatherCode from "./weatherCodes";

// types.ts
export interface WeatherData {
  current: {
    time: Date;
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: Date[];
    temperature_2m: Float32Array | null;
    weather_code: Float32Array | null;
    wind_speed_10m: Float32Array | null;
  };
  daily: {
    time: Date[];
    temperature_2m_max: Float32Array | null;
    temperature_2m_min: Float32Array | null;
    weather_code: Float32Array | null;
    wind_speed_10m_max: Float32Array | null;
  };
}

interface RouteProps {
  location: string;
  data: WeatherData | null;
}

const CurrRoute = ({location, data}: RouteProps) => (
  <View
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
    }}
  >
    <Text>Currently</Text>
    <View style={{ padding: 20, width: "100%" }}>
      <Text>{location}</Text>
      <Text>{getWeatherCode(data?.current?.weather_code)}</Text>
      <Text>{data?.current.temperature_2m.toFixed(1)}°C</Text>
      <Text>{data?.current.wind_speed_10m.toFixed(1)}km/h</Text>
    </View>
  </View>
);

interface TodayRouteProps {
  location: string;
  todayHourly: {
    time: Date;
    temperature_2m: number | undefined;
    weather_code: number | undefined;
    wind_speed_10m: number | undefined;
  }[];
}

interface WeeklyRouteProps {
  location: string;
  weekly: {
    time: Date;
    temperature_2m_max: number | undefined;
    temperature_2m_min: number | undefined;
    weather_code: number | undefined;
    wind_speed_10m_max: number | undefined;
  }[];
}

const truncate = (str: string, maxLength: number = 5) =>
  str.length > maxLength ? str.slice(0, maxLength) + "…" : str;

const TodayRoute = ({location, todayHourly}: TodayRouteProps) => (
  <View
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
    }}
  >
    <Text>Today</Text>
    <View style={{ padding: 20, width: "100%", height: "100%", overflow: "scroll" }}>
      <Text>{location}</Text>
      { !!todayHourly?.length && todayHourly.map((h, i) => {
        return (<View key={`hourly_${i}`} style={{display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center"}}>
        <Text>{h.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text>{h.temperature_2m?.toFixed(1)}°C</Text>
        <Text>{h.wind_speed_10m?.toFixed(1)}km/h</Text>
        <Text>{truncate(getWeatherCode(h.weather_code), 5)}</Text>
        </View>
      )})}
    </View>
  </View>
);

const WeeklyRoute = ({location, weekly}: WeeklyRouteProps) => (
  <View
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
    }}
  >
    <Text>Weekly</Text>
    <View style={{ padding: 20, width: "100%" }}>
      { !!weekly?.length && weekly.map((w, i) => {
        return (<View key={`weekly_${i}`} style={{display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center"}}>
        <Text>{w.time.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
        <Text>{w.temperature_2m_min?.toFixed(1)}°C</Text>
        <Text>{w.temperature_2m_max?.toFixed(1)}km/h</Text>
        <Text>{truncate(getWeatherCode(w.weather_code), 5)}</Text>
        </View>
      )})}
    </View>
    <Text>{getWeatherCode(weekly?.[0].weather_code)}</Text>
  </View>
);

interface Props {
  location: string;
  weatherData: WeatherData | null;
  style: {};
}

const CBottomNav = ({ location, weatherData, style }: Props) => {
  const today = new Date();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {
      key: "currently",
      title: "Currently",
      focusedIcon: "cog",
      unfocusedIcon: "cog-outline",
    },
    {
      key: "today",
      title: "Today",
      focusedIcon: "calendar-today",
      unfocusedIcon: "calendar-today-outline",
    },
    {
      key: "weekly",
      title: "Weekly",
      focusedIcon: "calendar-week",
      unfocusedIcon: "calendar-week-outline",
    },
  ]);

  const todayHourly = weatherData?.hourly.time
    .map((time, i) => ({
      time,
      temperature_2m: weatherData.hourly.temperature_2m?.[i],
      weather_code: weatherData.hourly.weather_code?.[i],
      wind_speed_10m: weatherData.hourly.wind_speed_10m?.[i],
    }))
    .filter(({ time }) => {
      const timeUTC = Date.UTC(time.getUTCFullYear(), time.getUTCMonth(), time.getUTCDate());
      const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      return timeUTC === todayUTC;
}) ?? []
  const weekly = weatherData?.daily.time.map((time, i) => ({
  time,
  temperature_2m_max: weatherData.daily.temperature_2m_max?.[i],
  temperature_2m_min: weatherData.daily.temperature_2m_min?.[i],
  weather_code: weatherData.daily.weather_code?.[i],
  wind_speed_10m_max: weatherData.daily.wind_speed_10m_max?.[i],
})) ?? [];


  const renderScene = BottomNavigation.SceneMap({
    currently: () => <CurrRoute location={location} data={weatherData} />,
    today: () => <TodayRoute location={location} todayHourly={todayHourly} />,
    weekly: () => <WeeklyRoute location={location} weekly={weekly} />,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      activeColor="white"
      inactiveColor="white"
      activeIndicatorStyle={{ backgroundColor: "#534DB3" }}
      barStyle={{ backgroundColor: "#534DB3" }}
      style={style}
    />
  );
};

export default CBottomNav;
