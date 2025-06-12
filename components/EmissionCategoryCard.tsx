import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { EmissionCategory } from '@/types/project';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Plug, Utensils, Hotel, Trash, Laptop, FileText, Fuel, HardDrive } from 'lucide-react-native';

interface EmissionCategoryCardProps {
  category: EmissionCategory;
  onPress: () => void;
}

export default function EmissionCategoryCard({ category, onPress }: EmissionCategoryCardProps) {
  const renderIcon = () => {
    const iconProps = {
      size: 28,
      color: category.color,
    };

    switch (category.icon) {
      case 'car':
        return <Car {...iconProps} />;
      case 'plug':
        return <Plug {...iconProps} />;
      case 'utensils':
        return <Utensils {...iconProps} />;
      case 'hotel':
        return <Hotel {...iconProps} />;
      case 'trash':
        return <Trash {...iconProps} />;
      case 'laptop':
        return <Laptop {...iconProps} />;
      case 'file-text':
        return <FileText {...iconProps} />;
      case 'fuel':
        return <Fuel {...iconProps} />;
      case 'hard-drive':
        return <HardDrive {...iconProps} />;
      default:
        return <Car {...iconProps} />;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[category.color + '20', category.color + '05']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.iconContainer, { backgroundColor: category.color + '15' }]}>
        {renderIcon()}
      </View>
      <Text style={[styles.name, { color: Colors.dark.text }]}>{category.name}</Text>
      <View style={[styles.indicator, { backgroundColor: category.color }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
});