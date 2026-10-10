import React from 'react';
import { AppSettings } from '../types';
import {
  Settings,
  Languages,
  Compass,
  Layers,
  Moon,
  Sun,
  Shield,
  Trash2,
  ExternalLink,
  Info,
  CheckCircle,
} from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearCache: () => void;
}

export const SettingsPage: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onClearCache,
}) => {
  return (
    <div className="min-h-screen pt-14 pb-20 px-3 sm:px-6 max-w-4xl mx-auto space-y-4">
      {/* হেডার */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-1">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          অ্যাপ সেটিংস ও পছন্দসমূহ
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ভাষা, সংখ্যা পদ্ধতি, প্রদর্শনী ও ডেটা ব্যবহারের পছন্দ পরিবর্তন করুন।
        </p>
      </div>

      {/* PWA ইনস্টল ব্যানার */}
      <PWAInstallButton variant="card" />

      {/* সেটিংস গ্রুপ ১: ভাষা ও সংখ্যা */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Languages className="w-4 h-4 text-emerald-600" />
          সংখ্যা ও একক
        </h3>

        {/* বাংলা সংখ্যা টগল */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">বাংলা সংখ্যা ব্যবহার</p>
            <p className="text-xs text-slate-500">দূরত্ব ও স্থানাঙ্কে বাংলা সংখ্যা (যেমন: ১২৩৪) দেখাবে</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ useBengaliNumerals: !settings.useBengaliNumerals })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              settings.useBengaliNumerals ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                settings.useBengaliNumerals ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* ডার্ক / লাইট থিম */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">থিম ও রঙ</p>
            <p className="text-xs text-slate-500">হালকা অথবা চোখ-বান্ধব ডার্ক মোড</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
          >
            {settings.theme === 'dark' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-teal-400" />
                <span>ডার্ক মোড</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>হালকা মোড</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* সেটিংস গ্রুপ ২: GPS ও অবস্থান */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-600" />
          জিপিএস ও অবস্থান নীতি
        </h3>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">উচ্চ নির্ভুলতার GPS (High Accuracy)</p>
            <p className="text-xs text-slate-500">ডিভাইসের সুনির্দিষ্ট স্যাটেলাইট অবস্থান ব্যবহার করে</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ highAccuracyGps: !settings.highAccuracyGps })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              settings.highAccuracyGps ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                settings.highAccuracyGps ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* সেটিংস গ্রুপ ৩: ক্যাশ ও রিসেট */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Trash2 className="w-4 h-4 text-rose-500" />
          স্টোরেজ ও ক্যাশ ব্যবস্থাপনা
        </h3>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">অস্থায়ী ম্যাপ ক্যাশ পরিষ্কার</p>
            <p className="text-xs text-slate-500">ব্রাউজারে জমে থাকা টাইল ও সাময়িক ডেটা মুক্ত করবে</p>
          </div>
          <button
            onClick={onClearCache}
            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition"
          >
            ক্যাশ মুছুন
          </button>
        </div>
      </div>

      {/* ওপেনস্ট্রিটম্যাপ কপিরাইট ও স্বীকৃতি (Section 4 & 23) */}
      <div className="bg-emerald-50/70 dark:bg-slate-900 rounded-2xl p-4 border border-emerald-200/60 dark:border-slate-800 space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
            মানচিত্রের তথ্য ও আইনগত স্বীকৃতি
          </h4>
        </div>

        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
          মানচিত্রের মূল ভৌগোলিক তথ্য <strong>© OpenStreetMap অবদানকারীগণ</strong> কর্তৃক ওপেন ডেটাবেস লাইসেন্স (ODbL) এর অধীনে উন্মুক্ত।
        </p>

        <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-slate-700 space-y-1.5">
          <p className="font-bold text-slate-800 dark:text-slate-200">ডেটার নির্ভুলতার নোটিশ:</p>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            ম্যাপের তথ্যের সম্পূর্ণতা ও নির্ভুলতা স্থানীয় ডেটা এবং সর্বশেষ আপডেটের ওপর নির্ভরশীল। কোনো রাস্তা বা স্থান সম্পর্কে তথ্য অনুপলব্ধ থাকলে তা অনুমান করে তৈরি করা হয় না।
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline"
          >
            <span>OpenStreetMap Copyright Policy</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
