import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'header' | 'card' | 'minimal';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>অ্যাপটি আপনার ডিভাইসে সফলভাবে ইনস্টল করা আছে।</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  if (isInstallable) {
    if (variant === 'header') {
      return (
        <button
          onClick={handleInstallClick}
          aria-label="আমিনপুর ম্যাপ অ্যাপ ইনস্টল করুন"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ইনস্টল করুন</span>
        </button>
      );
    }

    return (
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h4 className="font-bold text-sm flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            মোবাইলে অ্যাপ ইনস্টল করুন
          </h4>
          <p className="text-xs text-emerald-100">
            হোম স্ক্রিনে যুক্ত করে ইন্টারনেট ছাড়াও দ্রুত ওপেন করুন।
          </p>
        </div>
        <button
          onClick={handleInstallClick}
          className="flex-shrink-0 px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
        >
          ইনস্টল
        </button>
      </div>
    );
  }

  if (isIOS) {
    return (
      <>
        {variant === 'header' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            aria-label="আইফোনে ইনস্টল করার নিয়ম"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>আইওএস ইনস্টল</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-medium transition"
          >
            <Smartphone className="w-4 h-4" />
            আইফোনে ইনস্টল করার নিয়ম দেখুন
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  iPhone / iPad-এ ইনস্টল করার নিয়ম
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-3 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                  <span className="font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">১</span>
                  <span>Safari ব্রাউজারের নিচের টুলবারে থাকা <strong>Share (শেয়ার)</strong> আইকনটিতে ট্যাপ করুন।</span>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                  <span className="font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">২</span>
                  <span>তালিকা থেকে স্ক্রোল করে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> নির্বাচন করুন।</span>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                  <span className="font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">৩</span>
                  <span>উপরে ডানে <strong>Add</strong> বাটনে ক্লিক করলেই অ্যাপটি হোম স্ক্রিনে ইনস্টল হয়ে যাবে।</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
