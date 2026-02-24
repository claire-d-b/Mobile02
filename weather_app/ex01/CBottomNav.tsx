import * as React from "react";
import { BottomNavigation, Text } from "react-native-paper";
import { View } from "react-native";

interface Prop {
  location: string;
}

const CurrRoute = ({ location }: Prop) => (
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
    </View>
  </View>
);
const TodayRoute = ({ location }: Prop) => (
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
      <Text>{location}</Text>
    </View>
  </View>
);

const WeeklyRoute = ({ location }: Prop) => (
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
      <Text>{location}</Text>
    </View>
  </View>
);

interface Props {
  location: string;
  style: {};
}

const CBottomNav = ({ location, style }: Props) => {
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

  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "currently":
        return <CurrRoute location={location} />;
      case "today":
        return <TodayRoute location={location} />;
      case "weekly":
        return <WeeklyRoute location={location} />;
      default:
        return null;
    }
  };

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
