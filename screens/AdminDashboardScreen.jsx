import React from "react";
import { View, Text, StyleSheet } from "../components/WebCompatUI.native";
import { colors, typography } from "../theme/theme";

const AdminDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.fontSize.xlarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.onSurfaceVariant,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: typography.fontSize.medium,
    color: colors.onSurfaceVariant,
    opacity: 0.7,
  },
});

export default AdminDashboardScreen;
