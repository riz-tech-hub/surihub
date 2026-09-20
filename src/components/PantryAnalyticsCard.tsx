'use client';

import React, { useMemo } from 'react';
import { PantryItem, PantryHistoryLog } from '@/types';
import {
  estimateStockValueRM,
  analyzeTopConsumedItems,
  generatePredictionAlerts,
} from '@/utils/shelfLifeEstimator';
import { getDaysUntilExpiry } from '@/utils/helpers';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Flame,
  ShoppingBag,
  Info,
} from 'lucide-react';

interface PantryAnalyticsCardProps {
  items: PantryItem[];
  historyLogs: PantryHistoryLog[];
  onOpenAddModal?: () => void;
}

export const PantryAnalyticsCard: React.FC<PantryAnalyticsCardProps> = ({
  items,
  historyLogs,
  onOpenAddModal,
}) => {
  // Calculated stats
  const totalItems = items.length;

  const totalValueRM = useMemo(() => estimateStockValueRM(items), [items]);

  const topConsumed = useMemo(() => analyzeTopConsumedItems(historyLogs), [historyLogs]);

  const alerts = useMemo(() => generatePredictionAlerts(items, historyLogs), [items, historyLogs]);

  // Freshness breakdown
  const { freshCount, warningCount, expiredCount } = useMemo(() => {
    let fresh = 0;
    let warning = 0;
    let expired = 0;

    items.forEach((item) => {
      const days = getDaysUntilExpiry(item.expiryDate);
      if (days < 0) expired++;
      else if (days <= 5) warning++;
      else fresh++;
    });

    return { freshCount: fresh, warningCount: warning, expiredCount: expired };
  }, [items]);

  const freshPercent = totalItems > 0 ? Math.round((freshCount / totalItems) * 100) : 0;
  const warningPercent = totalItems > 0 ? Math.round((warningCount / totalItems) * 100) : 0;
  const expiredPercent = totalItems > 0 ? Math.round((expiredCount / totalItems) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rose-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              Analitik & Anggaran Nilai Stok
              <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                Pantry AI
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">Ringkasan kesegaran & anggaran nilai kewangan</p>
          </div>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Total Stock Count */}
        <div className="bg-gradient-to-br from-rose-50/70 to-pink-50/50 p-3 rounded-2xl border border-rose-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Jumlah Stok Item</span>
            <span className="text-xl font-black text-rose-700">{totalItems} <span className="text-xs font-normal">Bahan</span></span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white text-rose-500 flex items-center justify-center shadow-xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>

        {/* Total Estimated RM Value */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">Anggaran Nilai Stok</span>
            <span className="text-xl font-black text-emerald-700">RM {totalValueRM.toFixed(2)}</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-xs">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Freshness Ratio Multi-Segment Gauge */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Nisbah Kesegaran Stok:
          </span>
          <span className="text-[11px] text-gray-500">
            {freshPercent}% Segar • {warningPercent + expiredPercent}% Amaran
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-gray-200">
          <div
            className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
            style={{ width: `${freshPercent}%` }}
            title={`Segar: ${freshCount} item (${freshPercent}%)`}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-300"
            style={{ width: `${warningPercent}%` }}
            title={`Hampir Luput: ${warningCount} item (${warningPercent}%)`}
          />
          <div
            className="h-full bg-rose-500 rounded-r-full transition-all duration-300"
            style={{ width: `${expiredPercent}%` }}
            title={`Luput: ${expiredCount} item (${expiredPercent}%)`}
          />
        </div>

        {/* Legend Badges */}
        <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-semibold text-center">
          <div className="bg-emerald-50 text-emerald-800 py-1 rounded-xl border border-emerald-100 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Segar: {freshCount}</span>
          </div>
          <div className="bg-amber-50 text-amber-800 py-1 rounded-xl border border-amber-100 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Hampir: {warningCount}</span>
          </div>
          <div className="bg-rose-50 text-rose-800 py-1 rounded-xl border border-rose-100 flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Luput: {expiredCount}</span>
          </div>
        </div>
      </div>

      {/* Top 3 Frequently Consumed Items */}
      {topConsumed.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-rose-50">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Bahan Paling Kerap Diguna / Ditambah:
          </span>
          <div className="flex space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
            {topConsumed.map((item, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 font-semibold flex items-center gap-1 flex-shrink-0"
              >
                <span className="text-rose-600 font-bold">#{idx + 1}</span>
                <span>{item.itemName}</span>
                <span className="text-[10px] text-gray-400 font-normal">({item.count}x)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Smart Prediction Recommendation Banners */}
      {alerts.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-rose-50">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-2xl border text-xs leading-relaxed flex items-start justify-between gap-2 ${
                alert.type === 'expiring'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-bold block text-xs">{alert.title}</span>
                <span>{alert.message}</span>
              </div>

              {onOpenAddModal && (
                <button
                  onClick={onOpenAddModal}
                  className="flex-shrink-0 px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-xl border text-[11px] shadow-2xs transition whitespace-nowrap"
                >
                  {alert.actionLabel || 'Lihat'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
