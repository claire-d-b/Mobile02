import * as Location from "expo-location";
import * as IntentLauncher from "expo-intent-launcher";
import { useState, useEffect } from "react";
import { Platform, Alert } from "react-native";

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
  if (!gpsOn) {
    isGPSEnabled();
    return null;
  }

  if (Platform.OS === "ios") return { latitude: 48.89632, longitude: 2.31852 };

  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
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

const useLocation = () => {
  const [address, setAddress] = useState<string>("");
  const [coords, setCoords] = useState<Coords>({
    latitude: 48.8397,
    longitude: 2.2421,
  });
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false); // ✅ signals when done

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

    const init = async () => {
      const initialCoords = await getLocation();
      if (initialCoords) {
        const currentCoords = {
          latitude: initialCoords.latitude,
          longitude: initialCoords.longitude,
        };
        setCoords(currentCoords);

        const name = await getLocationName(currentCoords);
        setAddress(name ?? "");
        setLoading(false);
        setReady(true); // ✅ done

        subscriber = await trackLocation(async (newCoords) => {
          setCoords(newCoords);
          const newAddress = await getLocationName(newCoords);
          setAddress(newAddress ?? "");
        });
      } else {
        console.warn("Location permission denied");
      }
    };
    init();

    return () => subscriber?.remove();
  }, []);

  return { address };
};

export default useLocation;
