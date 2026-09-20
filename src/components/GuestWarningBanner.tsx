'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, ArrowRight, CloudUpload } from 'lucide-react';

export const GuestWarningBanner: React.FC = () => {
  const { isGuest, openAuthModal } = useAuth();

  if (!isGuest) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border-b border-rose-200/80 backdrop-blur-md px-4 py-2.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        <div className="flex items-start space-x-2 text-xs">
          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-gray-800 leading-snug font-medium">
            <span className="font-bold text-rose-700">⚠️ Mod Tetamu:</span> Data anda hanya disimpan secara tempatan pada pelayar ini. Sign in untuk backup cloud & sync peranti.
          </p>
        </div>

        <button
          onClick={() => openAuthModal('login')}
          className="flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full font-bold text-xs shadow-xs flex items-center space-x-1 transition active:scale-95"
        >
          <CloudUpload className="w-3 h-3" />
          <span className="whitespace-nowrap">Sign In Now</span>
        </button>
      </div>
    </div>
  );
};
