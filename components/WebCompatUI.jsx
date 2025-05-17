import React from "react";

// Web-compatible versions of React Native components
export const View = ({ style, children, ...props }) => (
  <div style={style} {...props}>
    {children}
  </div>
);

export const Text = ({ style, children, ...props }) => (
  <span style={style} {...props}>
    {children}
  </span>
);

export const TouchableOpacity = ({ style, onPress, children, ...props }) => (
  <button
    style={{
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: 0,
      margin: 0,
      textAlign: "left",
      ...style,
    }}
    onClick={onPress}
    {...props}
  >
    {children}
  </button>
);

export const TextInput = ({
  style,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  ...props
}) => (
  <input
    style={style}
    value={value}
    onChange={(e) => onChangeText(e.target.value)}
    placeholder={placeholder}
    type={secureTextEntry ? "password" : "text"}
    {...props}
  />
);

export const Image = ({ source, style, resizeMode, ...props }) => (
  <img
    src={source.uri}
    style={{
      objectFit: resizeMode === "contain" ? "contain" : "cover",
      ...style,
    }}
    {...props}
  />
);

export const ScrollView = ({ contentContainerStyle, children, ...props }) => (
  <div style={{ overflowY: "auto", ...props.style }}>
    <div style={contentContainerStyle}>{children}</div>
  </div>
);

export const KeyboardAvoidingView = ({ style, children, ...props }) => (
  <div style={style}>{children}</div>
);

export const ActivityIndicator = ({ size, color, ...props }) => {
  const sizeValue = size === "small" ? 16 : 32;

  return (
    <div
      style={{
        width: sizeValue,
        height: sizeValue,
        borderRadius: "50%",
        borderWidth: 2,
        borderStyle: "solid",
        borderColor: `${color} transparent ${color} transparent`,
        animation: "spin 1s linear infinite",
        ...props.style,
      }}
    />
  );
};

// Mock Platform for web
export const Platform = {
  OS: "web",
};

// Mock StyleSheet for web
export const StyleSheet = {
  create: (styles) => styles,
};
