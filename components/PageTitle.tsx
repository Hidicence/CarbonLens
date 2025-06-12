import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import Colors from '@/constants/colors';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function PageTitle({ title, subtitle, centered = false }: PageTitleProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, centered && styles.centered]}>
      <Text style={[styles.title, { color: theme.text }, centered && styles.centeredText]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.secondaryText }, centered && styles.centeredText]}>
          {subtitle}
        </Text>
      )}
      {centered && (
        <View style={[styles.underline, { backgroundColor: theme.primary }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  centeredText: {
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
  },
  underline: {
    height: 3,
    width: 40,
    borderRadius: 2,
    marginTop: 8,
  },
});