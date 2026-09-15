'use client';

import React from 'react';
import { ShoppingBag, UtensilsCrossed, Sparkles } from 'lucide-react';

export type TabType = 'dapur' | 'menu' | 'kemas';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  nearExpiryBadge?: number;
  choreBadgePercent?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  nearExpiryBadge = 0,
}) => {
  const tabs = [
    {
      id: 'dapur' as TabType,
      label: 'Dapur (Stok)',
      icon: ShoppingBag,
      badge: nearExpiryBadge > 0 ? nearExpiryBadge : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'menu' as TabType,
      label: 'Menu (Resipi)',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: 'kemas' as TabType,
      label: 'Kemas (Tugas)',
      icon: Sparkles,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-rose-100 shadow-[0_-4px_20px_rgba(244,63,94,0.08)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-3 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-rose-600 font-bold'
                  : 'text-gray-400 hover:text-gray-600 font-medium'
              }`}
            >
              {/* Active top line highlight */}
              {isActive && (
                <span className="absolute top-0 w-12 h-1 bg-rose-500 rounded-b-full shadow-sm" />
              )}

              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110 text-rose-500' : ''}`} />
                {tab.badge && (
                  <span className={`absolute -top-1.5 -right-2.5 px-1.5 py-0.2 text-[10px] rounded-full font-extrabold shadow-sm ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'text-rose-600 font-bold' : 'text-gray-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
