import React, { createContext, useContext } from "react";
import { theme, colors, typography } from "./theme";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ theme, colors, typography }}>
      {children}
    </ThemeContext.Provider>
  );
};
