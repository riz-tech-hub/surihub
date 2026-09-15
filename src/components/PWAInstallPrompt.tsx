'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  onInstallReady?: (canInstall: boolean, promptFn: () => void) => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onInstallReady }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service worker registration failed:', err);
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setShowBanner(true);
      if (onInstallReady) {
        onInstallReady(true, () => triggerInstall(event));
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [onInstallReady]);

  const triggerInstall = async (evtToUse?: BeforeInstallPromptEvent | null) => {
    const promptEvt = evtToUse || deferredPrompt;
    if (!promptEvt) return;

    await promptEvt.prompt();
    const { outcome } = await promptEvt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-rose-200 shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center space-x-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">
            Pasang SuriHub di Telefon
            <Sparkles className="w-3 h-3 text-rose-500" />
          </h4>
          <p className="text-[11px] text-gray-500">Akses pantas tanpa internet di skrin utama!</p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => triggerInstall()}
          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Pasang
        </button>

        <button
          onClick={() => setShowBanner(false)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
