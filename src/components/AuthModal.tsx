'use client';

import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { Heart, Mail, Lock, Sparkles, LogIn, UserPlus, Send, X, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'magic'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setErrorMsg('Sila kemaskini NEXT_PUBLIC_SUPABASE_URL & ANON_KEY dalam .env.local terlebih dahulu.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setSuccessMsg('Log masuk berjaya! Selamat kembali.');
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess();
          onClose();
        }, 1000);
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setSuccessMsg('Pendaftaran berjaya! Sila semak e-mel anda untuk pengesahan akaun.');
      } else if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
        });
        if (error) throw error;
        setSuccessMsg('Pautan log masuk (Magic Link) telah dihantar ke e-mel anda!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ralat berlaku semasa log masuk.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-rose-100 space-y-4 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base">Akaun SuriHub 💕</h3>
              <p className="text-xs text-rose-600 font-medium">Log Masuk untuk Simpan Data di Cloud</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-rose-50 hover:text-rose-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator if Supabase is not configured */}
        {!isSupabaseConfigured() && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Kunci Supabase Belum Ditetapkan</span>
              <span>Sila gantikan `YOUR_SUPABASE_URL` dalam fail `.env.local` untuk mengaktifkan pangkalan data Supabase secara penuh.</span>
            </div>
          </div>
        )}

        {/* Mode selector tabs */}
        <div className="grid grid-cols-3 gap-1 bg-rose-50 p-1 rounded-2xl text-xs font-bold text-center">
          <button
            onClick={() => setMode('login')}
            className={`py-1.5 rounded-xl transition ${mode === 'login' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-600'}`}
          >
            Log Masuk
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`py-1.5 rounded-xl transition ${mode === 'signup' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-600'}`}
          >
            Daftar
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`py-1.5 rounded-xl transition ${mode === 'magic' ? 'bg-rose-500 text-white shadow-xs' : 'text-gray-600'}`}
          >
            Magic Link
          </button>
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
            ✓ {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Alamat E-mel</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
              />
            </div>
          </div>

          {mode !== 'magic' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Kata Laluan</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl text-sm shadow-md flex items-center justify-center space-x-2 transition active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Memproses...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log Masuk Akaun</span>
              </>
            ) : mode === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akaun Baru</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Hantar Pautan E-mel</span>
              </>
            )}
          </button>
        </form>

        {/* Offline / Demo option */}
        <div className="pt-2 border-t border-rose-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-rose-600 font-medium underline"
          >
            Teruskan Menggunakan Mod Luar Talian (Local Storage)
          </button>
        </div>
      </div>
    </div>
  );
};
