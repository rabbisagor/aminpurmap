import React from 'react';
import { Map, Search, Compass, DownloadCloud, Bookmark, Settings } from 'lucide-react';

export type ActiveTab = 'map' | 'search' | 'nearby' | 'offline' | 'saved' | 'settings';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  savedCount?: number;
  isOffline?: boolean;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onTabChange,
  savedCount = 0,
  isOffline = false,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'map', label: 'ম্যাপ', icon: Map },
    { id: 'search', label: 'অনুসন্ধান', icon: Search },
    { id: 'nearby', label: 'কাছাকাছি', icon: Compass },
    { id: 'offline', label: 'অফলাইন', icon: DownloadCloud },
    { id: 'saved', label: 'সংরক্ষিত', icon: Bookmark },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  return (
    <nav
      aria-label="মূল নেভিগেশন"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1 sm:px-4 py-1.5 transition-colors"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 font-normal'
              }`}
            >
              <div
                className={`relative p-1 rounded-full transition-all ${
                  isActive ? 'bg-emerald-100 dark:bg-emerald-950/60' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />

                {/* ব্যাজ: সংরক্ষিত স্থান সংখ্যা */}
                {tab.id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {savedCount}
                  </span>
                )}

                {/* ব্যাজ: অফলাইন সূচক */}
                {tab.id === 'offline' && isOffline && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>

              <span className="text-[11px] leading-tight tracking-tight mt-0.5 truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
