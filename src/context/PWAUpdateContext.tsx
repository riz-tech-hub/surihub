'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PWAUpdateContextType {
  isUpdating: boolean;
  updateToast: string | null;
  forcePurgeCacheAndReload: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

const PWAUpdateContext = createContext<PWAUpdateContextType | undefined>(undefined);

export const PWAUpdateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateToast, setUpdateToast] = useState<string | null>(null);

  /**
   * Purges all browser caches, unregisters active Service Worker,
   * updates stored build ID, and hard reloads the application.
   */
  const forcePurgeCacheAndReload = async () => {
    setIsUpdating(true);
    setUpdateToast('🚀 Membersihkan cache & memuatkan versi terkini...');

    try {
      // 1. Unregister active service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // 2. Clear Cache Storage API
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // 3. Clear stored build ID
      localStorage.removeItem('app_build_id');

      // 4. Force reload browser
      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (err) {
      console.error('Error during forced cache purge:', err);
      window.location.reload();
    }
  };

  /**
   * Checks /api/version for deployment updates.
   */
  const checkForUpdates = async () => {
    try {
      const res = await fetch(`/api/version?t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      if (!res.ok) return;

      const data = await res.json();
      const newBuildId = data.buildId;
      const storedBuildId = localStorage.getItem('app_build_id');

      if (storedBuildId && storedBuildId !== newBuildId) {
        setUpdateToast('🚀 Versi baharu SuriHub dikesan! Menyegar semula...');
        localStorage.setItem('app_build_id', newBuildId);
        await forcePurgeCacheAndReload();
      } else {
        localStorage.setItem('app_build_id', newBuildId);
      }
    } catch (err) {
      console.warn('Failed to poll /api/version:', err);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Service Worker Update Listener with updateViaCache: 'none'
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Trigger immediate update
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                setUpdateToast('🚀 Versi baharu SuriHub dikemaskini! Menyegar semula...');
                setTimeout(() => {
                  window.location.reload();
                }, 1000);
              }
            });
          });
        })
        .catch((err) => {
          console.error('Service Worker registration error:', err);
        });
    }

    // 2. Poll build version on load and when window regains focus
    checkForUpdates();

    const handleFocus = () => checkForUpdates();
    window.addEventListener('focus', handleFocus);

    // 3. Periodic poll every 5 minutes
    const interval = setInterval(() => {
      checkForUpdates();
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  return (
    <PWAUpdateContext.Provider
      value={{
        isUpdating,
        updateToast,
        forcePurgeCacheAndReload,
        checkForUpdates,
      }}
    >
      {children}

      {/* Version Update Toast Overlay */}
      {updateToast && (
        <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto bg-gray-900/95 text-white backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-gray-700 flex items-center justify-between animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 text-rose-400 animate-spin" />
            <span>{updateToast}</span>
          </div>
        </div>
      )}
    </PWAUpdateContext.Provider>
  );
};

export const usePWAUpdate = () => {
  const context = useContext(PWAUpdateContext);
  if (!context) {
    throw new Error('usePWAUpdate must be used within a PWAUpdateProvider');
  }
  return context;
};
