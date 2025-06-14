import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Film, 
  Camera, 
  Lightbulb, 
  Mic, 
  Palette, 
  Settings, 
  Shirt, 
  Package, 
  Truck, 
  Users,
  Laptop,
  MapPin,
  Utensils,
  FileText 
} from 'lucide-react-native';
import { FilmCrew } from '@/types/project';

export interface CrewOption {
  key: FilmCrew;
  name: string;
  icon: any;
  color: string;
}

export const CREW_OPTIONS: CrewOption[] = [
  { key: 'director', name: '導演組', icon: Film, color: '#FF6B6B' },
  { key: 'camera', name: '攝影組', icon: Camera, color: '#4ECDC4' },
  { key: 'lighting', name: '燈光組', icon: Lightbulb, color: '#FFE66D' },
  { key: 'sound', name: '收音組', icon: Mic, color: '#A8E6CF' },
  { key: 'makeup', name: '化妝組', icon: Palette, color: '#FFB3BA' },
  { key: 'production', name: '製片組', icon: FileText, color: '#D4E6B7' },
];

export const getCrewIcon = (crew: string, size: number = 16, color?: string) => {
  const crewOption = CREW_OPTIONS.find(c => c.key === crew);
  if (!crewOption) {
    return <Users size={size} color={color || '#666'} />;
  }
  
  const IconComponent = crewOption.icon;
  return <IconComponent size={size} color={color || crewOption.color} />;
};

export const getCrewColor = (crew: string): string => {
  const crewOption = CREW_OPTIONS.find(c => c.key === crew);
  return crewOption?.color || '#F8F9FA';
};

export const getCrewName = (crew: string): string => {
  const crewOption = CREW_OPTIONS.find(c => c.key === crew);
  return crewOption?.name || '其他';
}; 