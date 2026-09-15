'use client';

import React from 'react';
import { Heart, Sparkles, AlertTriangle, CheckCircle2, Utensils, Download, User, LogOut } from 'lucide-react';
import { formatMalayDate } from '@/utils/helpers';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  nearExpiryCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  todayMealSummary: string;
  onInstallClick?: () => void;
  canInstall?: boolean;
  currentUser?: SupabaseUser | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  nearExpiryCount,
  completedTasksCount,
  totalTasksCount,
  todayMealSummary,
  onInstallClick,
  canInstall = false,
  currentUser = null,
  onOpenAuth,
  onSignOut,
}) => {
  const dateStr = formatMalayDate();
  const chorePercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500 text-white shadow-md rounded-b-3xl px-4 pt-4 pb-5">
      <div className="max-w-md mx-auto space-y-3">
        {/* Top title bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Heart className="w-6 h-6 text-white fill-rose-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                SuriHub
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-rose-50 font-normal border border-white/30">
                  v1.0 PWA
                </span>
              </h1>
              <p className="text-xs text-rose-100 font-medium">Salam Suri! 💕 • {dateStr}</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {currentUser ? (
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30 text-xs">
                <span className="truncate max-w-[80px] font-semibold text-rose-100">
                  {currentUser.email?.split('@')[0]}
                </span>
                <button onClick={onSignOut} title="Log Keluar" className="p-0.5 text-white hover:text-rose-200">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-xs border border-white/30 backdrop-blur-md transition active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Akaun</span>
              </button>
            )}

            {canInstall && (
              <button
                onClick={onInstallClick}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white text-rose-600 rounded-full font-bold text-xs shadow-lg hover:bg-rose-50 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick status pill overview bar */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Near expiry pill */}
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 flex flex-col items-center text-center">
            <div className="flex items-center space-x-1 text-rose-100 font-semibold mb-0.5">
              <AlertTriangle className={`w-3.5 h-3.5 ${nearExpiryCount > 0 ? 'text-amber-300 animate-pulse' : 'text-rose-200'}`} />
              <span>Hampir Luput</span>
            </div>
            <span className="text-sm font-bold text-white">{nearExpiryCount} Item</span>
          </div>

          {/* Today meal pill */}
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 flex flex-col items-center text-center">
            <div className="flex items-center space-x-1 text-rose-100 font-semibold mb-0.5">
              <Utensils className="w-3.5 h-3.5 text-amber-200" />
              <span>Tengah Hari</span>
            </div>
            <span className="text-xs font-medium text-white truncate max-w-[100px]" title={todayMealSummary}>
              {todayMealSummary || 'Belum Ditetapkan'}
            </span>
          </div>

          {/* Chores progress pill */}
          <div className="bg-white/15 backdrop-blur-md rounded-xl p-2 border border-white/20 flex flex-col items-center text-center">
            <div className="flex items-center space-x-1 text-rose-100 font-semibold mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Kemas Hari Ini</span>
            </div>
            <span className="text-sm font-bold text-white">{chorePercent}% Selesai</span>
          </div>
        </div>
      </div>
    </header>
  );
};
