// Web-compatible theme without React Navigation dependency

export const colors = {
  primary: "#006782",
  primaryContainer: "#BDE9FF",
  onPrimaryContainer: "#001F2A",
  secondary: "#4D616C",
  secondaryContainer: "#D0E6F2",
  onSecondaryContainer: "#071E28",
  tertiary: "#5D5B7D",
  tertiaryContainer: "#E2DFFF",
  onTertiaryContainer: "#1A1836",
  background: "#FBFCFE",
  surface: "#FBFCFE",
  surfaceVariant: "#DCE4E9",
  onSurfaceVariant: "#40484C",
  error: "#BA1A1A",
  errorContainer: "#FFDAD6",
  onError: "#FFFFFF",
  onErrorContainer: "#410002",
};

export const typography = {
  fontFamily: "Roboto, sans-serif",
  fontSize: {
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    bold: "700",
  },
};

export const theme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.onSurfaceVariant,
    border: colors.surfaceVariant,
    notification: colors.error,
  },
};
