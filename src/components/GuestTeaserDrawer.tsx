'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  Cloud,
  Smartphone,
  Bell,
  ShieldCheck,
  X,
  LogIn,
  Lock,
  Sparkles,
} from 'lucide-react';

export const GuestTeaserDrawer: React.FC = () => {
  const {
    isGuestDrawerOpen,
    closeGuestDrawer,
    openAuthModal,
    loginWithGoogle,
    attemptedAction,
  } = useAuth();

  if (!isGuestDrawerOpen) return null;

  const handleGoogleClick = async () => {
    const { error } = await loginWithGoogle();
    if (error) {
      // If error occurs (e.g. Supabase unconfigured), fall back to opening auth modal with message
      openAuthModal('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 md:p-4">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0"
        onClick={closeGuestDrawer}
      />

      {/* Sliding Sheet Drawer Container */}
      <div className="relative z-10 bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl border border-rose-100 space-y-5 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Handle Bar for mobile drawer visual */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto -mt-2 mb-2 md:hidden" />

        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-rose-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">
                Sign In for Full Access & Cloud Backup 💕
              </h3>
              <p className="text-xs text-rose-600 font-semibold mt-0.5">
                Simpan & Senkronisasi Data SuriHub Anda
              </p>
            </div>
          </div>
          <button
            onClick={closeGuestDrawer}
            className="p-1.5 rounded-full text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Attempted Action Banner if triggered by a write action */}
        {attemptedAction && (
          <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <div>
              <span className="font-bold">Akses Mod Tetamu Dipadam:</span>{' '}
              <span>
                Sila log masuk untuk membuat tindakan <strong>"{attemptedAction}"</strong> dan simpan rekod ini di akaun anda.
              </span>
            </div>
          </div>
        )}

        {/* Value Proposition List */}
        <div className="space-y-3 bg-gradient-to-b from-rose-50/40 to-pink-50/30 p-4 rounded-2xl border border-rose-100">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Kelebihan Akaun SuriHub:
          </h4>

          <div className="grid grid-cols-1 gap-2.5 text-xs text-gray-700">
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-gray-900 block">☁️ Automatic Cloud Backup</span>
                <span className="text-gray-500">Stok dapur & menu tidak akan hilang jika pelayar dipadam.</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-gray-900 block">📱 Multi-Device Sync</span>
                <span className="text-gray-500">Kongsi senarai stok & kemas rumah bersama peranti suami/isteri.</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-gray-900 block">🔔 Expiry Alerts & Sync</span>
                <span className="text-gray-500">Dapatkan amaran bahan hampir luput pada bila-bila masa.</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-gray-900 block">🔒 Akaun Selamat & Percuma</span>
                <span className="text-gray-500">100% percuma, tanpa iklan & data anda sentiasa dilindungi.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {/* Google Sign In CTA */}
          <button
            onClick={handleGoogleClick}
            className="w-full py-3 px-4 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-bold rounded-2xl text-sm shadow-sm flex items-center justify-center space-x-3 transition active:scale-98"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          {/* Email Login CTA */}
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-98"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Email / Password</span>
          </button>

          {/* Continue as Guest dismiss button */}
          <button
            onClick={closeGuestDrawer}
            className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-700 font-semibold transition"
          >
            Teruskan Mod Guest (Pratonton Sahaja)
          </button>
        </div>
      </div>
    </div>
  );
};
