'use client';

import React, { useState, useMemo } from 'react';
import { PantryHistoryLog, PantryActionType } from '@/types';
import {
  Search,
  Download,
  Trash2,
  PlusCircle,
  Utensils,
  AlertTriangle,
  Edit3,
  History,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Filter,
  X,
  Sparkles,
} from 'lucide-react';

interface PantryHistoryViewProps {
  logs: PantryHistoryLog[];
  onClearLogs?: () => void;
}

export const PantryHistoryView: React.FC<PantryHistoryViewProps> = ({ logs, onClearLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('Semua');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filtered logs sorted newest first
  const filteredLogs = useMemo(() => {
    const now = new Date().getTime();

    return logs
      .filter((log) => {
        // Search item name or notes
        const matchesSearch =
          log.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter action type
        const matchesAction = selectedAction === 'Semua' || log.actionType === selectedAction;

        // Filter date range
        let matchesDate = true;
        const logTime = new Date(log.timestamp).getTime();
        const diffHours = (now - logTime) / (1000 * 3600);

        if (dateRange === 'today') {
          matchesDate = diffHours <= 24;
        } else if (dateRange === 'week') {
          matchesDate = diffHours <= 24 * 7;
        } else if (dateRange === 'month') {
          matchesDate = diffHours <= 24 * 30;
        }

        return matchesSearch && matchesAction && matchesDate;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchQuery, selectedAction, dateRange]);

  // Action badge configuration
  const getActionBadge = (actionType: PantryActionType) => {
    switch (actionType) {
      case 'ADDED':
        return {
          label: 'Ditambah',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: PlusCircle,
          dotColor: 'bg-emerald-500',
        };
      case 'CONSUMED':
        return {
          label: 'Habis Guna',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Utensils,
          dotColor: 'bg-amber-500',
        };
      case 'EXPIRED':
        return {
          label: 'Telah Luput',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: AlertTriangle,
          dotColor: 'bg-rose-500',
        };
      case 'EDITED':
        return {
          label: 'Dikemaskini',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Edit3,
          dotColor: 'bg-blue-500',
        };
      case 'DELETED':
        return {
          label: 'Dipadam',
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Trash2,
          dotColor: 'bg-gray-400',
        };
    }
  };

  // Format timestamp into Malay relative / full string
  const formatTimestamp = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleString('ms-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  // Export logs to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('Tiada rekod log untuk dimuat turun.');
      return;
    }

    const headers = ['ID', 'Nama Bahan', 'Tindakan', 'Kuantiti Delta', 'Unit', 'Tarikh & Masa', 'Nota'];
    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.itemName.replace(/"/g, '""')}"`,
      `"${log.actionType}"`,
      log.quantityDelta,
      `"${log.unit}"`,
      `"${log.timestamp}"`,
      `"${(log.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `surihub_pantry_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export logs to JSON
  const handleExportJSON = () => {
    if (filteredLogs.length === 0) {
      alert('Tiada rekod log untuk dimuat turun.');
      return;
    }

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `surihub_pantry_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Sejarah & Audit Log Dapur</h3>
              <p className="text-[11px] text-gray-400">Rekod automatik pergerakan stok bahan dapur</p>
            </div>
          </div>

          <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full border border-rose-100">
            {filteredLogs.length} Rekod
          </span>
        </div>

        {/* Action Toolbar: Export CSV, Export JSON, Clear */}
        <div className="flex items-center justify-between pt-2 border-t border-rose-50 gap-2">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-1 transition active:scale-95"
              title="Muat Turun Format CSV (Excel)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold rounded-xl border border-blue-200 flex items-center gap-1 transition active:scale-95"
              title="Muat Turun Format JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-blue-600" />
              <span>JSON</span>
            </button>
          </div>

          {onClearLogs && (
            <button
              onClick={() => {
                if (confirm('Adakah anda pasti ingin memadamkan seluruh sejarah log dapur?')) {
                  onClearLogs();
                }
              }}
              className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Padam Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari dalam sejarah (e.g. Ayam, Bawang, Mydin)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-rose-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-sm text-gray-800"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Type Filter Pills & Date Range Filter */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex space-x-1 flex-shrink-0">
            {['Semua', 'ADDED', 'CONSUMED', 'EXPIRED', 'EDITED', 'DELETED'].map((act) => {
              const isActive = selectedAction === act;
              const labels: Record<string, string> = {
                Semua: 'Semua',
                ADDED: 'Tambah',
                CONSUMED: 'Habis',
                EXPIRED: 'Luput',
                EDITED: 'Kemaskini',
                DELETED: 'Padam',
              };

              return (
                <button
                  key={act}
                  onClick={() => setSelectedAction(act)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex-shrink-0 ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {labels[act] || act}
                </button>
              );
            })}
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-2 py-1 bg-white border border-rose-200 rounded-full text-[11px] font-semibold text-gray-700 focus:outline-none flex-shrink-0"
          >
            <option value="all">Semua Masa</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-3 pt-1">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-rose-200 text-gray-400 space-y-2">
            <History className="w-10 h-10 text-rose-300 mx-auto" />
            <p className="font-semibold text-gray-700 text-sm">Tiada Rekod Sejarah</p>
            <p className="text-xs text-gray-400">
              Sebarang tindakan tambah, guna, atau padam bahan dapur akan dipaparkan di sini secara automatik.
            </p>
          </div>
        ) : (
          <div className="relative pl-4 border-l-2 border-rose-200/70 space-y-3 ml-2">
            {filteredLogs.map((log) => {
              const badge = getActionBadge(log.actionType);
              const BadgeIcon = badge.icon;

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div
                    className={`absolute -left-[23px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white ${badge.dotColor} shadow-xs`}
                  />

                  {/* Log Card */}
                  <div className="bg-white rounded-2xl p-3.5 border border-rose-100 shadow-xs hover:shadow-md transition space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-800 text-sm">{log.itemName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${badge.bg}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    {/* Quantity & Notes */}
                    <div className="text-xs text-gray-600 flex items-center justify-between pt-0.5">
                      <span>
                        Perubahan Kuantiti:{' '}
                        <strong className={log.quantityDelta > 0 ? 'text-emerald-600' : log.quantityDelta < 0 ? 'text-rose-600' : 'text-gray-700'}>
                          {log.quantityDelta > 0 ? `+${log.quantityDelta}` : log.quantityDelta} {log.unit}
                        </strong>
                      </span>

                      {log.notes && <span className="text-gray-400 italic text-[11px]">"{log.notes}"</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
