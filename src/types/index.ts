export type CategoryType = 'Bahan Basah' | 'Bahan Kering' | 'Pes/Rempah';

export interface PantryItem {
  id: string;
  name: string;
  category: CategoryType;
  quantity: string;
  expiryDate: string; // YYYY-MM-DD
  addedDate: string;
  notes?: string;
  storageType?: 'Room Temp' | 'Chiller' | 'Freezer';
  estimatedValueRM?: number;
}

export type PantryActionType = 'ADDED' | 'CONSUMED' | 'EXPIRED' | 'EDITED' | 'DELETED';

export interface PantryHistoryLog {
  id: string;
  itemId: string;
  itemName: string;
  actionType: PantryActionType;
  quantityDelta: number;
  unit: string;
  timestamp: string; // ISO date string
  notes?: string;
}

export interface PresetIngredient {
  name: string;
  category: CategoryType;
  defaultQuantity: string;
  defaultDaysToExpiry: number;
  emoji: string;
}

export interface IngredientRequirement {
  name: string;
  requiredQty: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  category: 'Lauk Utama' | 'Sup' | 'Goreng' | 'Sambal/Pes' | 'Sarapan';
  requiredIngredients: IngredientRequirement[];
  instructions: string[];
  imageEmoji: string;
}

export type DayOfWeek = 'Isnin' | 'Selasa' | 'Rabu' | 'Khamis' | 'Jumaat' | 'Sabtu' | 'Ahad';

export interface MealPlanDay {
  day: DayOfWeek;
  sarapan: string;
  makanTengahHari: string;
  makanMalam: string;
  notes?: string;
}

export interface BatchPrepItem {
  id: string;
  task: string;
  category: string;
  completed: boolean;
}

export type ZoneType = 'Dapur' | 'Ruang Tamu' | 'Bilik Air' | 'Bilik Tidur';

export interface CleaningTask {
  id: string;
  title: string;
  zone: ZoneType;
  completed: boolean;
  estimatedMinutes: number;
}

export interface QuickTask {
  id: string;
  title: string;
  minutes: number;
  iconEmoji: string;
  completed: boolean;
}
