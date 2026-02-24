import * as Location from "expo-location";
import React, { useState, useEffect, use } from "react";
import { View, ActivityIndicator, BlurEvent } from "react-native";
import { Appbar, Text, IconButton, Icon, Menu } from "react-native-paper";
import { evaluate } from "mathjs";
import CTextInput from "./CTextInput";
import CBottomNav from "./CBottomNav";
import { useLocation, getPlacesList } from "./useLocation";

const messages = [
  "7",
  "8",
  "9",
  "C",
  "AC",
  "4",
  "5",
  "6",
  "+",
  "-",
  "1",
  "2",
  "3",
  "x",
  "/",
  "0",
  ".",
  "00",
  "=",
  "",
];

interface Place {
  name: string;
  admin1: string;
  country: string;
  latitude: number;
  longitude: number;
}

export default function CAppbar() {
  const { address: detectedAddress } = useLocation();
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [placesList, setPlacesList] = useState<Place[]>([]);


  useEffect(() => {
    const fetchPlaces = async () => {
      const list = await getPlacesList(address);
      console.log("list", list);
      setPlacesList(list);
    };

    fetchPlaces();
    console.log(placesList);
  }, [address]); // also changed to depend on location, not address

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Appbar.Header
        style={{
          backgroundColor: "#534DB3",
          padding: 0,
          margin: 5,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Icon source="magnify" color="white" size={20} />
          <CTextInput
            onBlur={(e: any) => {
              setLocation(address);
            }}
            onChangeText={(text: string) => setAddress(text)}
            textColor="white"
            label="Location"
            msg={address}
            placeholder="Search location..."
            variant="flat"
            outlineColor="white"
            activeOutlineColor="white"
            underlineColor="white"
            activeUnderlineColor="white"
            selectionColor="white"
            contentStyle={{}}
            style={{
              backgroundColor: "transparent",
              width: "75%",
              borderRadius: 15,
              borderColor: "white",
            }}
          />
        </View>
        <IconButton
          icon="navigation"
          iconColor="white"
          size={20}
          onPress={() => {
            setLocation(detectedAddress);
          }}
          style={{ transform: "rotate(45deg);" }}
        />
      </Appbar.Header>
      <View
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <View
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!!placesList.length &&
            placesList.map((p, i) => {
              return (
                <View key={`place_${i}`} style={{ display: "flex" }}>
                  <Menu.Item
                    title={
                      <>
                        <Text
                          style={{ fontWeight: "bold" }}
                        >{`${p.name}, `}</Text>
                        <Text>{`${p.admin1}, `}</Text>
                        <Text>{`${p.country}`}</Text>
                      </>
                    }
                  ></Menu.Item>
                </View>
              );
            })}

          <CBottomNav
            location={location}
            style={{
              paddingBottom: 40,
            }}
          />
        </View>
      </View>
    </View>
  );
}
