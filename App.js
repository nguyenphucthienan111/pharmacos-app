import React, { Suspense, useEffect, useState } from "react";
import { Platform } from "react-native";
import { UserProvider } from "./context/UserContext";

const App = () => {
  const [Navigator, setNavigator] = useState(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      import("./navigation/WebAppNavigator").then((mod) => {
        setNavigator(() => mod.default);
      });
      if (process.env.NEXT_PUBLIC_TEMPO) {
        import("tempo-devtools").then(({ TempoDevtools }) => {
          TempoDevtools.init();
        });
      }
    } else {
      import("./navigation/AppNavigator").then((mod) => {
        setNavigator(() => mod.default);
      });
    }
  }, []);

  if (!Navigator) return null;

  return (
    <UserProvider>
      <Suspense fallback={null}>
        <Navigator />
      </Suspense>
    </UserProvider>
  );
};

export default App;
