import React, { Suspense } from "react";
import { Platform } from "react-native";
import { UserProvider } from "./context/UserContext";
import AppNavigator from "./navigation/AppNavigator";
import WebAppNavigator from "./navigation/WebAppNavigator";

const App = () => {
  return (
    <UserProvider>
      {Platform.OS === "web" ? (
        <Suspense fallback={null}>
          <WebAppNavigator />
        </Suspense>
      ) : (
        <AppNavigator />
      )}
    </UserProvider>
  );
};

export default App;
