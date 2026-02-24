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
    <View style={{ padding: 35 }}>
      <Text>{location}</Text>
      <Text>{getWeatherCode(data?.current.weather_code)}</Text>
      <Text>{data?.current.temperature_2m.toFixed(1)}°C</Text>
      <Text>{data?.current.wind_speed_10m.toFixed(1)}km/h</Text>
    </View>
  </View>
);
const TodayRoute = ({location, data}: RouteProps) => (
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
    <View style={{ padding: 35 }}>
      <Text>{data?.hourly.weather_code}</Text>
    </View>
  </View>
);

const WeeklyRoute = ({location, data}: RouteProps) => (
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
    <View style={{ padding: 35 }}>
      <Text>{data?.daily.weather_code}</Text>
    </View>
  </View>
);

interface Props {
  location: string;
  weatherData: WeatherData | null;
  style: {};
}

const CBottomNav = ({ location, weatherData, style }: Props) => {
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

  const renderScene = BottomNavigation.SceneMap({
    currently: () => <CurrRoute location={location} data={weatherData} />,
    today: () => <TodayRoute location={location} data={weatherData} />,
    weekly: () => <WeeklyRoute location={location} data={weatherData} />,
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
