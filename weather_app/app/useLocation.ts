import * as Location from "expo-location";
import * as IntentLauncher from "expo-intent-launcher";
import { useState, useEffect } from "react";
import { Platform, Alert } from "react-native";
import { fetchWeatherApi } from "openmeteo";

interface Coords {
  latitude: number;
  longitude: number;
}

const requestPermission = async (): Promise<boolean> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
};

export const isGPSEnabled = async (): Promise<boolean> => {
  Alert.alert(
    "GPS Settings",
    "Please enable location services to detect your position.",
    [
      {
        text: "Allow",
        onPress: () => {
          if (Platform.OS === "android") {
            IntentLauncher.startActivityAsync(
              IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS,
            );
          } else {
            Location.enableNetworkProviderAsync(); // iOS
          }
        },
      },
      {
        text: "Do not allow",
        onPress: () => {
          console.warn("No permission to use GPS.");
        },
      },
    ],
  );

  const enabled = await Location.hasServicesEnabledAsync();
  return enabled;
};

/* Get current location */

const getLocation = async (): Promise<Coords | null> => {
  const granted = await requestPermission();
  if (!granted) return null;
  const gpsOn = await isGPSEnabled();
  if (!gpsOn) return null;
  if (Platform.OS === "android") {
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  } else return { latitude: 48.89632, longitude: 2.31852 };
};

/* Track location changes */
export const trackLocation = async (
  onChange: (coords: Coords) => void,
): Promise<Location.LocationSubscription | null> => {
  const granted = await requestPermission();
  if (!granted) return null;

  const subscriber = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // every 5 seconds
      distanceInterval: 10, // or every 10 meters
    },
    ({ coords }) => {
      onChange({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    },
  );

  return subscriber;
};

const getLocationName = async (coords: Coords): Promise<string | null> => {
  const [place] = await Location.reverseGeocodeAsync(coords);
  if (!place) return null;

  return [
    place.streetNumber,
    place.street,
    place.city,
    place.region,
    place.country,
  ]
    .filter(Boolean)
    .join(", ");
};

interface WeatherParams {
  latitude: number;
  longitude: number;
  hourly: string;
  current: string;
}

const getWeather = async ({
  latitude,
  longitude,
  hourly,
  current,
}: WeatherParams): Promise<string | null> => {
  const params = { latitude, longitude, hourly, current };
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const nlatitude = response.latitude();
  const nlongitude = response.longitude();
  const elevation = response.elevation();
  const utcOffsetSeconds = response.utcOffsetSeconds();

  const coordinates: Coords = { latitude: nlatitude, longitude: nlongitude };
  const name = await getLocationName(coordinates);

  console.log(
    `\nCoordinates: ${nlatitude}°N ${nlongitude}°E`,
    `\nName: ${name}`,
    `\nElevation: ${elevation}m asl`,
    `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
  );

  const ncurrent = response.current()!;
  const nhourly = response.hourly()!;

  const weatherData = {
    current: {
      time: new Date((Number(ncurrent.time()) + utcOffsetSeconds) * 1000),
      temperature_2m: ncurrent.variables(0)!.value(),
    },
    hourly: {
      time: Array.from(
        {
          length:
            (Number(nhourly.timeEnd()) - Number(nhourly.time())) /
            nhourly.interval(),
        },
        (_, i) =>
          new Date(
            (Number(nhourly.time()) +
              i * nhourly.interval() +
              utcOffsetSeconds) *
              1000,
          ),
      ),
      temperature_2m: nhourly.variables(0)!.valuesArray(),
    },
  };

  // The 'weatherData' object now contains a simple structure, with arrays of datetimes and weather information
  console.log(
    `\nCurrent time: ${weatherData.current.time}\n`,
    weatherData.current.temperature_2m,
  );
  console.log("\nHourly data:\n", weatherData.hourly);
  return name;
};

export const getPlacesList = async (location: string) => {
  if (!location) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results ?? [];
};

export const useLocation = () => {
  const [address, setAddress] = useState<string>("");
  const [coords, setCoords] = useState<Coords>({
    latitude: 48.8397,
    longitude: 2.2421,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (getWeather({
      latitude: coords.latitude,
      longitude: coords.longitude,
      hourly: "temperature_2m",
      current: "temperature_2m",
    }),
      [location]);
  });

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

    const init = async () => {
      const initialCoords = await getLocation();
      const currentCoords = {
        latitude: initialCoords?.latitude ?? 48.89632,
        longitude: initialCoords?.longitude ?? 2.31852,
      };
      setCoords(currentCoords);

      const name = await getLocationName(currentCoords);
      setAddress(name ?? "");
      setLoading(false);

      subscriber = await trackLocation(async (newCoords) => {
        setCoords(newCoords);
        const newAddress = await getLocationName(newCoords);
        setAddress(newAddress ?? "");
      });
    };

    init();

    return () => subscriber?.remove();
  }, []);

  return { address };
};

export default useLocation;
