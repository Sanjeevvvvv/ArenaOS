'use client';

import React, { useEffect, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Download, X, WifiOff } from 'lucide-react';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const { isInstallable, installApp } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Service Worker Manager
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'development') {
        // Unregister service worker in dev mode to prevent chunk and HMR caching issues
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log('Successfully unregistered ServiceWorker for Dev Mode safety.');
              }
            });
          }
        });
      } else {
        // Register Service Worker in production
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then(
            (registration) => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            },
            (err) => {
              console.log('ServiceWorker registration failed: ', err);
            }
          );
        });
      }
    }

    // Monitor Network Connectivity
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const goOnline = () => setIsOffline(false);
      const goOffline = () => setIsOffline(true);

      window.addEventListener('online', goOnline);
      window.addEventListener('offline', goOffline);

      return () => {
        window.removeEventListener('online', goOnline);
        window.removeEventListener('offline', goOffline);
      };
    }
  }, []);

  useEffect(() => {
    if (isInstallable) {
      setShowBanner(true);
    }
  }, [isInstallable]);

  return (
    <>
      {/* Offline Status Toast */}
      {isOffline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-red-950/90 border border-red-500/50 rounded-full text-red-200 text-sm font-medium shadow-lg backdrop-blur-md animate-bounce">
          <WifiOff className="h-4 w-4 text-red-400" />
          <span>Local Offline Mode Active (Cached State Loaded)</span>
        </div>
      )}

      {/* PWA Install Banner */}
      {showBanner && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[90vw] glass-panel rounded-xl p-4 shadow-xl border border-primary/20 animate-in slide-in-from-bottom-5">
          <div className="flex gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary h-fit">
              <Download className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm">Install ArenaOS</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Install as a mobile app for offline maps, real-time ticket scanning, and instant emergency alerts.
              </p>
              <div className="flex gap-2 mt-3 justify-end">
                <button
                  onClick={() => setShowBanner(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-white/5 transition"
                >
                  Later
                </button>
                <button
                  onClick={() => {
                    installApp();
                    setShowBanner(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-black hover:bg-primary/95 transition font-semibold"
                >
                  Install Now
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-muted-foreground hover:text-white transition"
              aria-label="Close install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
