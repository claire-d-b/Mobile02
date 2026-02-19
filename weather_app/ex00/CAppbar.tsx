import * as Location from "expo-location";
import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, BlurEvent } from "react-native";
import { Appbar, Text, IconButton, Icon } from "react-native-paper";
import { evaluate } from "mathjs";
import CTextInput from "./CTextInput";
import CBottomNav from "./CBottomNav";
import useLocation from "./useLocation";

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

export default function CAppbar() {
  const { address: detectedAddress } = useLocation();
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");

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
