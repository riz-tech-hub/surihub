import { PantryItem, PantryHistoryLog, CategoryType } from '@/types';
import { getDaysUntilExpiry, getFutureDateStr } from './helpers';

export type StorageLocation = 'Room Temp' | 'Chiller' | 'Freezer';

export interface ShelfLifePrediction {
  suggestedDaysToExpiry: number;
  suggestedExpiryDate: string;
  tooltipMessage: string;
  recommendedStorage: StorageLocation;
}

export interface SmartAlert {
  id: string;
  type: 'expiring' | 'depleting' | 'reorder';
  title: string;
  message: string;
  actionLabel?: string;
  actionItemName?: string;
}

/**
 * Predicts recommended shelf life days, expiry date, and usage tooltip
 * based on Malaysian household grocery defaults and storage conditions.
 */
export function predictShelfLife(
  name: string,
  category: CategoryType,
  storageType: StorageLocation,
  quantityStr: string = '1'
): ShelfLifePrediction {
  const lowerName = name.toLowerCase();

  let days = 7;
  let defaultStorage: StorageLocation = 'Chiller';

  // 1. Determine recommended storage & default days
  if (
    lowerName.includes('ayam') ||
    lowerName.includes('daging') ||
    lowerName.includes('udang') ||
    lowerName.includes('ikan') ||
    lowerName.includes('sotong')
  ) {
    defaultStorage = 'Freezer';
    if (storageType === 'Freezer') days = 60;
    else if (storageType === 'Chiller') days = 3;
    else days = 1;
  } else if (
    lowerName.includes('bawang') ||
    lowerName.includes('halia') ||
    lowerName.includes('kentang') ||
    lowerName.includes('rempah') ||
    lowerName.includes('beras') ||
    lowerName.includes('kicap') ||
    lowerName.includes('sos') ||
    lowerName.includes('minyak')
  ) {
    defaultStorage = 'Room Temp';
    if (storageType === 'Room Temp') days = 21;
    else if (storageType === 'Chiller') days = 14;
    else days = 30;
  } else if (
    lowerName.includes('santan') ||
    lowerName.includes('cili kisar') ||
    lowerName.includes('pes')
  ) {
    defaultStorage = 'Chiller';
    if (storageType === 'Chiller') days = 5;
    else if (storageType === 'Freezer') days = 45;
    else days = 2;
  } else if (category === 'Bahan Basah') {
    defaultStorage = 'Chiller';
    if (storageType === 'Freezer') days = 45;
    else if (storageType === 'Chiller') days = 5;
    else days = 2;
  } else if (category === 'Bahan Kering') {
    defaultStorage = 'Room Temp';
    if (storageType === 'Room Temp') days = 45;
    else days = 60;
  } else {
    defaultStorage = 'Chiller';
    days = storageType === 'Freezer' ? 60 : storageType === 'Chiller' ? 7 : 14;
  }

  const suggestedExpiryDate = getFutureDateStr(days);
  const locationText =
    storageType === 'Freezer'
      ? 'Sejuk Beku (Freezer)'
      : storageType === 'Chiller'
      ? 'Peti Ais (Chiller)'
      : 'Suhu Bilik (Room Temp)';

  const tooltipMessage = `💡 Berdasarkan kuantiti "${quantityStr || '1 unit'}" dalam ${locationText}, anggaran tempoh segar ialah ~${days} hari untuk kegunaan isi rumah.`;

  return {
    suggestedDaysToExpiry: days,
    suggestedExpiryDate,
    tooltipMessage,
    recommendedStorage: defaultStorage,
  };
}

/**
 * Calculates total estimated monetary value of all pantry items in Ringgit Malaysia (RM).
 */
export function estimateStockValueRM(items: PantryItem[]): number {
  return items.reduce((total, item) => {
    if (item.estimatedValueRM && item.estimatedValueRM > 0) {
      return total + item.estimatedValueRM;
    }

    // Default estimate fallback based on category
    const lowerName = item.name.toLowerCase();
    let estimatedUnitValue = 8; // fallback default RM8

    if (lowerName.includes('ayam')) estimatedUnitValue = 18;
    else if (lowerName.includes('udang') || lowerName.includes('daging')) estimatedUnitValue = 25;
    else if (lowerName.includes('ikan')) estimatedUnitValue = 14;
    else if (lowerName.includes('bawang')) estimatedUnitValue = 6;
    else if (lowerName.includes('santan')) estimatedUnitValue = 4;
    else if (lowerName.includes('minyak')) estimatedUnitValue = 15;
    else if (item.category === 'Bahan Basah') estimatedUnitValue = 12;
    else if (item.category === 'Bahan Kering') estimatedUnitValue = 8;
    else if (item.category === 'Pes/Rempah') estimatedUnitValue = 5;

    return total + estimatedUnitValue;
  }, 0);
}

/**
 * Identifies Top 3 most frequently consumed items from history logs.
 */
export function analyzeTopConsumedItems(logs: PantryHistoryLog[]): { itemName: string; count: number }[] {
  const counts: Record<string, number> = {};

  logs.forEach((log) => {
    if (log.actionType === 'CONSUMED' || log.actionType === 'ADDED') {
      counts[log.itemName] = (counts[log.itemName] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([itemName, count]) => ({ itemName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

/**
 * Generates smart prediction alerts (re-order, fast depletion, expiring soon).
 */
export function generatePredictionAlerts(items: PantryItem[], logs: PantryHistoryLog[]): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // 1. Expiring soon alert
  const expiringItems = items.filter((item) => {
    const days = getDaysUntilExpiry(item.expiryDate);
    return days >= 0 && days <= 2;
  });

  if (expiringItems.length > 0) {
    alerts.push({
      id: 'alert-expiring',
      type: 'expiring',
      title: 'Amaran Tempoh Segar',
      message: `⚠️ ${expiringItems.length} bahan (${expiringItems.map((i) => i.name).slice(0, 2).join(', ')}) menghampiri tarikh luput dalam 2 hari.`,
      actionLabel: 'Lihat Stok',
    });
  }

  // 2. Depletion / Re-order alerts based on history logs
  const consumedCounts: Record<string, number> = {};
  logs.forEach((log) => {
    if (log.actionType === 'CONSUMED') {
      consumedCounts[log.itemName] = (consumedCounts[log.itemName] || 0) + 1;
    }
  });

  const fastDepletingNames = Object.entries(consumedCounts)
    .filter(([_, count]) => count >= 2)
    .map(([name]) => name);

  if (fastDepletingNames.length > 0) {
    const topDepleting = fastDepletingNames[0];
    alerts.push({
      id: 'alert-depleting',
      type: 'depleting',
      title: 'Cadangan Tambah Stok',
      message: `💡 ${topDepleting} susut lebih pantas daripada biasa. Ingin tambah ke senarai beli-belah?`,
      actionLabel: 'Tambah Stok',
      actionItemName: topDepleting,
    });
  }

  return alerts;
}
