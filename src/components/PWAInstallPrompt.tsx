'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, Share, PlusSquare } from 'lucide-react';

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
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if app is already running as standalone (Added to Home Screen)
    const checkIfStandalone = (): boolean => {
      if (typeof window === 'undefined') return false;

      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      const isTWA = document.referrer.includes('android-app://');

      return isStandaloneMedia || isIOSStandalone || isTWA;
    };

    if (checkIfStandalone()) {
      setIsInstalled(true);
      setShowBanner(false);
      if (onInstallReady) onInstallReady(false, () => {});
      return;
    }

    // 2. Detect iOS environment (Safari does not fire beforeinstallprompt)
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isIOSDevice = /iphone|ipad|ipod/i.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Register Service Worker in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch((err) => {
        console.error('Service worker registration failed:', err);
      });
    }

    // 4. Handle Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setShowBanner(true);
      if (onInstallReady) {
        onInstallReady(true, () => triggerInstall(event));
      }
    };

    // 5. Handle appinstalled event (fired when user completes installation)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      if (onInstallReady) onInstallReady(false, () => {});
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If iOS Safari (and not standalone), make install ready via iOS guide modal
    if (isIOSDevice) {
      setShowBanner(true);
      if (onInstallReady) {
        onInstallReady(true, () => setShowIOSModal(true));
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstallReady]);

  const triggerInstall = async (evtToUse?: BeforeInstallPromptEvent | null) => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    const promptEvt = evtToUse || deferredPrompt;
    if (!promptEvt) {
      // Fallback: If no prompt event, show generic guidance or iOS modal
      setShowIOSModal(true);
      return;
    }

    try {
      await promptEvt.prompt();
      const { outcome } = await promptEvt.userChoice;

      if (outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
        setIsInstalled(true);
        if (onInstallReady) onInstallReady(false, () => {});
      }
    } catch (err) {
      console.error('Error triggering PWA install:', err);
    }
  };

  // If already installed or running in standalone mode, DO NOT render anything
  if (isInstalled) return null;

  return (
    <>
      {/* Smart Top Floating Banner */}
      {showBanner && (
        <div className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-rose-200 shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">
                Tambah Pintasan SuriHub
                <Sparkles className="w-3 h-3 text-rose-500" />
              </h4>
              <p className="text-[11px] text-gray-500">Buka terus di skrin utama telefon anda!</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => triggerInstall()}
              className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              Pasang
            </button>

            <button
              onClick={() => setShowBanner(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-rose-100 space-y-4 animate-in zoom-in duration-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Tambah SuriHub ke Skrin Utama 📲
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Ikuti 2 langkah mudah ini di pelayar Safari anda:
              </p>
            </div>

            <div className="bg-rose-50/60 rounded-2xl p-4 text-xs space-y-3 border border-rose-100 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-xl bg-rose-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div className="flex-1 text-gray-700">
                  Ketik butang <strong>Kongsi (Share)</strong> <Share className="w-4 h-4 inline text-blue-500 mx-0.5" /> di bahagian bawah skrin pelayar Safari.
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-xl bg-pink-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div className="flex-1 text-gray-700">
                  Skrol & pilih <strong>"Tambah ke Skrin Utama"</strong> <PlusSquare className="w-4 h-4 inline text-gray-700 mx-0.5" /> (Add to Home Screen).
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Faham & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
