import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmissionCategory, EmissionSource, ProductionStage } from '@/types/project';
import { EMISSION_CATEGORIES, STAGE_CATEGORIES, EMISSION_SOURCES } from '@/mocks/projects';

interface DatabaseState {
  emissionCategories: EmissionCategory[];
  stageCategories: {
    'pre-production': EmissionCategory[];
    'production': EmissionCategory[];
    'post-production': EmissionCategory[];
  };
  emissionSources: EmissionSource[];
  
  // Actions
  updateEmissionCategory: (id: string, updates: Partial<EmissionCategory>) => void;
  updateStageCategory: (id: string, stage: ProductionStage, updates: Partial<EmissionCategory>) => void;
  updateEmissionSource: (id: string, updates: Partial<EmissionSource>) => void;
  addEmissionSource: (source: Omit<EmissionSource, 'id'>) => void;
  deleteEmissionSource: (id: string) => void;
  resetToDefaults: () => void;
}

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set) => ({
      emissionCategories: EMISSION_CATEGORIES,
      stageCategories: STAGE_CATEGORIES || {
        'pre-production': [],
        'production': [],
        'post-production': []
      },
      emissionSources: EMISSION_SOURCES,
      
      updateEmissionCategory: (id, updates) => {
        set((state) => ({
          emissionCategories: state.emissionCategories.map((category) => 
            category.id === id ? { ...category, ...updates } : category
          )
        }));
      },
      
      updateStageCategory: (id, stage, updates) => {
        set((state) => ({
          stageCategories: {
            ...state.stageCategories,
            [stage]: state.stageCategories[stage].map((category) => 
              category.id === id ? { ...category, ...updates } : category
            )
          }
        }));
      },
      
      updateEmissionSource: (id, updates) => {
        set((state) => ({
          emissionSources: state.emissionSources.map((source) => 
            source.id === id ? { ...source, ...updates } : source
          )
        }));
      },
      
      addEmissionSource: (sourceData) => {
        const newSource: EmissionSource = {
          ...sourceData,
          id: Date.now().toString(),
        };
        
        set((state) => ({
          emissionSources: [...state.emissionSources, newSource]
        }));
      },
      
      deleteEmissionSource: (id) => {
        set((state) => ({
          emissionSources: state.emissionSources.filter((source) => source.id !== id)
        }));
      },
      
      resetToDefaults: () => {
        set({
          emissionCategories: EMISSION_CATEGORIES,
          stageCategories: STAGE_CATEGORIES || {
            'pre-production': [],
            'production': [],
            'post-production': []
          },
          emissionSources: EMISSION_SOURCES,
        });
      }
    }),
    {
      name: 'database-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);