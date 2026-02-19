npx create-expo-app@latest weather_app

cd weather_app

npm run reset-project

# go to android studio Projects -> More Actions -> SDK manager -> languages & Frameworks -> Android SDK
echo "export ANDROID_HOME=$HOME/Library/Android/sdk" >> ~/.zshrc
echo "export PATH=$PATH:$ANDROID_HOME/emulator" >> ~/.zshrc
echo "export PATH=$PATH:$ANDROID_HOME/platform-tools" >> ~/.zshrc

source $HOME/.zshrc

# When you start a development server with npx expo start on the start developing page, press a to open the Android Emulator. Expo CLI will install Expo Go automatically.
# Open up the Mac App Store, search for Xcode, and click Install (or Update if you have it already).
# Open Xcode, choose Settings... from the Xcode menu (or press cmd ⌘ + ,). Go to the Locations and install the tools by selecting the most recent version in the Command Line Tools dropdown.

# To install an iOS Simulator, open Xcode > Settings... > Components, and under Platform Support > iOS ..., click Get.
brew update && brew install watchman

# npm run reset-project puts the example project in app-example folder

npx tailwindcss init

cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

cat > global.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

touch metro.config.js

cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)
 
module.exports = withNativeWind(config, { input: './global.css' })
EOF

cat > app/index.tsx << 'EOF'
import "../global.css";
import { Text } from "react-native-paper";

export default function App() {
  return (
    <Text>HELLO WORLD</Text>
  );
}
EOF

if [ "$(uname)" = "Darwin" ]; then
  sed -i '' 's/import { Stack } from "expo-router";/import { Stack } from "expo-router";\nimport "..\/global.css";/' app/_layout.tsx
else
  sed -i 's/import { Stack } from "expo-router";/import { Stack } from "expo-router";\nimport "..\/global.css";/' app/_layout.tsx
fi

if [ "$(uname)" = "Darwin" ]; then
    sed -i '' 's/"web": {/"web": {\n      "bundler": "metro",/' app.json
else
    sed -i 's/"web": {/"web": {\n      "bundler": "metro",/' app.json
fi

touch nativewind-env.d.ts && echo "/// <reference types="nativewind/types" />" > nativewind-env.d.ts

npm install react-native-paper
npm install react-native-safe-area-context
npx pod-install # for iOS platform there is a requirement to link the native parts of the library
npm install @react-native-vector-icons/material-design-icons

cat > babel.config.js << 'EOF'
module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        env: {
            production: {
                plugins: ["react-native-paper/babel"],
            },
        },
    };
};
EOF

npm i
npm install nativewind react-native-reanimated react-native-safe-area-context
npm install --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11 babel-preset-expo

npm install mathjs

npm install expo-location react-native-maps expo-intent-launcher

npx expo start
# When you start a development server with npx expo start on the start developing page, press i to open the iOS Simulator. Expo CLI will install Expo Go automatically.
