import React from 'react';
import { Layers, Plus, Wifi, WifiOff, Sun, Moon } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AppSettings } from '../types';

interface Props {
  isOnline: boolean;
  onOpenLayers: () => void;
  onOpenAddPlace: () => void;
  settings: AppSettings;
  onToggleTheme: () => void;
}

export const Header: React.FC<Props> = ({
  isOnline,
  onOpenLayers,
  onOpenAddPlace,
  settings,
  onToggleTheme,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs px-3 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* লোগো ও ব্র্যান্ডিং */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 flex items-center justify-center text-white font-black text-sm shadow-sm ring-2 ring-emerald-500/20 flex-shrink-0">
            আ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                আমিনপুর ম্যাপ
              </h1>
              {/* অনলাইন / অফলাইন সূচক */}
              <span
                title={isOnline ? 'ইন্টারনেট সংযুক্ত' : 'অফলাইন মোড'}
                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isOnline
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 animate-pulse'
                }`}
              >
                {isOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>অনলাইন</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-2.5 h-2.5 text-amber-700" />
                    <span>অফলাইন</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              পাবনা জেলা • ডিজিটাল ওপেনস্ট্রিটম্যাপ ও অফলাইন পিডব্লিউএ
            </p>
          </div>
        </div>

        {/* ডানদিকের টুলবার বাটন */}
        <div className="flex items-center gap-1.5">
          <PWAInstallButton variant="header" />

          {/* নতুন স্থান যোগ বাটন */}
          <button
            onClick={onOpenAddPlace}
            title="নতুন স্থান বা তথ্য যোগ করুন"
            className="flex items-center gap-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">স্থান যোগ</span>
          </button>

          {/* স্তর নির্বাচন বাটন */}
          <button
            onClick={onOpenLayers}
            title="মানচিত্রের স্তর পরিবর্তন"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95"
          >
            <Layers className="w-4 h-4 text-teal-600" />
          </button>

          {/* থিম পরিবর্তন */}
          <button
            onClick={onToggleTheme}
            title={settings.theme === 'dark' ? 'হালকা থিম' : 'ডার্ক থিম'}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
