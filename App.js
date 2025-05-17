import React, { Suspense, useEffect } from "react";
import { Platform } from "react-native";
import { UserProvider } from "./context/UserContext";
import AppNavigator from "./navigation/AppNavigator";
import WebAppNavigator from "./navigation/WebAppNavigator";
import { TempoDevtools } from "tempo-devtools";

const App = () => {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TEMPO) {
      TempoDevtools.init();
    }
  }, []);

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
