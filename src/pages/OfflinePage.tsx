import React, { useState, useEffect } from 'react';
import {
  DownloadCloud,
  CheckCircle,
  Trash2,
  HardDrive,
  WifiOff,
  AlertTriangle,
  Layers,
  Map,
  ShieldCheck,
} from 'lucide-react';
import {
  startDownloadPack,
  cancelDownload,
  removeDownloadedPack,
  isPackDownloaded,
  AMINPUR_OFFLINE_PACK_META,
  DownloadProgress,
} from '../offline/offlineManager';
import { getStorageEstimate, getOfflinePacks } from '../offline/db';
import { formatNumber } from '../utils/bangla';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
}

export const OfflinePage: React.FC<Props> = ({ settings }) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    status: 'idle',
    percentage: 0,
    message_bn: '',
    totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
  });
  const [storageInfo, setStorageInfo] = useState<{ usedMb: string; quotaMb: string }>({
    usedMb: '০.০',
    quotaMb: '০.০',
  });
  const [downloadDate, setDownloadDate] = useState<string | null>(null);

  const checkStatus = async () => {
    const isReady = await isPackDownloaded();
    setDownloaded(isReady);

    const packs = await getOfflinePacks();
    if (packs.length > 0) {
      setDownloadDate(new Date(packs[0].downloadedAt).toLocaleDateString('bn-BD'));
    }

    const est = await getStorageEstimate();
    setStorageInfo({
      usedMb: (est.usedBytes / (1024 * 1024)).toFixed(1),
      quotaMb: (est.quotaBytes / (1024 * 1024)).toFixed(0),
    });
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleDownload = async () => {
    await startDownloadPack((progress) => {
      setDownloadProgress(progress);
      if (progress.status === 'completed') {
        setDownloaded(true);
        checkStatus();
      }
    });
  };

  const handleCancel = () => {
    cancelDownload();
    setDownloadProgress({
      status: 'cancelled',
      percentage: 0,
      message_bn: 'ডাউনলোড বাতিল করা হয়েছে।',
      totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
    });
  };

  const handleDelete = async () => {
    if (window.confirm('আপনি কি অফলাইন ম্যাপ ডেটা মুছে ফেলতে চান?')) {
      await removeDownloadedPack();
      setDownloaded(false);
      setDownloadProgress({ status: 'idle', percentage: 0, message_bn: '', totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb });
      checkStatus();
    }
  };

  return (
    <div className="min-h-screen pt-14 pb-20 px-3 sm:px-6 max-w-4xl mx-auto space-y-4">
      {/* হেডার */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-emerald-600">
          <DownloadCloud className="w-6 h-6" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            আমিনপুর অফলাইন ম্যাপ সেন্টার
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          ইন্টারনেট সংযোগ ছাড়াও পুরো আমিনপুর থানা এলাকার রাস্তা, গ্রাম, বাজার ও স্কুল অনুসন্ধান করতে এই অফলাইন ম্যাপ প্যাকটি ডিভাইসে সংরক্ষণ করে রাখুন।
        </p>
      </div>

      {/* অফলাইন স্ট্যাটাস ও ডাউনলোড কার্ড */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full">
              অফিশিয়াল আঞ্চলিক প্যাক
            </span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {AMINPUR_OFFLINE_PACK_META.name_bn}
            </h3>
            <p className="text-xs text-slate-500">
              সংস্করণ: {AMINPUR_OFFLINE_PACK_META.version} • আকার: প্রায়{' '}
              {formatNumber(AMINPUR_OFFLINE_PACK_META.estimatedSizeMb, settings.useBengaliNumerals)} মেগাবাইট
            </p>
          </div>

          {downloaded ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>ইনস্টল করা আছে</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium flex-shrink-0">
              <WifiOff className="w-4 h-4 text-slate-400" />
              <span>ডাউনলোড হয়নি</span>
            </div>
          )}
        </div>

        {/* প্যাকেজের অন্তর্ভুক্তি বিবরণ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-[11px]">সংরক্ষিত স্থান</p>
            <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">
              {formatNumber(AMINPUR_OFFLINE_PACK_META.placesCount, settings.useBengaliNumerals)}+ টি
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-[11px]">রাস্তার নেটওয়ার্ক</p>
            <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">
              {formatNumber(AMINPUR_OFFLINE_PACK_META.roadsCount, settings.useBengaliNumerals)} টি মূল অক্ষ
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-[11px]">প্রশাসনিক ইউনিয়ন</p>
            <p className="font-extrabold text-slate-800 dark:text-white mt-0.5">
              {formatNumber(8, settings.useBengaliNumerals)} টি
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-[11px]">রাউটিং ইঞ্জিন</p>
            <p className="font-extrabold text-emerald-600 mt-0.5">১০০% অফলাইন</p>
          </div>
        </div>

        {/* ডাউনলোড প্রগ্রেস বার */}
        {downloadProgress.status === 'downloading' && (
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-white">
              <span>{downloadProgress.message_bn}</span>
              <span>{formatNumber(downloadProgress.percentage, settings.useBengaliNumerals)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgress.percentage}%` }}
              />
            </div>
            <button
              onClick={handleCancel}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              ডাউনলোড বাতিল করুন
            </button>
          </div>
        )}

        {/* সম্পন্ন বার্তা */}
        {downloaded && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs font-bold">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>অফলাইন ম্যাপ ব্যবহারের জন্য প্রস্তুত</span>
          </div>
        )}

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {!downloaded ? (
            <button
              onClick={handleDownload}
              disabled={downloadProgress.status === 'downloading'}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <DownloadCloud className="w-5 h-5" />
              <span>অফলাইন ম্যাপ ডাউনলোড করুন</span>
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                ডাউনলোডের তারিখ: {downloadDate || 'আজ'}
              </span>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-bold transition border border-rose-200 dark:border-rose-900"
              >
                <Trash2 className="w-4 h-4" />
                <span>প্যাক মুছে ফেলুন</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ব্রাউজার স্টোরেজ হিসাব */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <HardDrive className="w-5 h-5 text-slate-400" />
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">ডিভাইস স্টোরেজ স্থিতি</p>
            <p className="text-slate-500 text-[11px]">
              ব্যবহৃত: {formatNumber(storageInfo.usedMb, settings.useBengaliNumerals)} MB • সর্বোচ্চ কোটা:{' '}
              {formatNumber(storageInfo.quotaMb, settings.useBengaliNumerals)} MB
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md">
          IndexedDB
        </span>
      </div>

      {/* অফলাইন নীতি ও নির্দেশনাবলী (Section 4 & 9) */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ওপেনস্ট্রিটম্যাপ ও অফলাইন ব্যবহারের শর্তাবলী</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
          <li>
            OpenStreetMap টাইল সার্ভারের ব্যবহার নীতি মেনে চলার জন্য এখানে নির্বিচারে সার্ভারের টাইল ডাম্প না করে অনুমোদিত ভেক্টর ডেটা ও রোড গ্রাফ সংরক্ষিত হয়।
          </li>
          <li>
            ইন্টারনেট সম্পূর্ণ বন্ধ থাকলেও আপনি ম্যাপের সমস্ত পাকা-কাঁচা রাস্তা, নদী, ঘাট ও স্থান দেখতে এবং রুট পরিকল্পনা করতে পারবেন।
          </li>
          <li>
            ম্যাপের তথ্যের সম্পূর্ণতা ও নির্ভুলতা স্থানীয় ওপেনস্ট্রিটম্যাপ অবদানকারীদের সর্বশেষ আপডেটের ওপর নির্ভরশীল।
          </li>
        </ul>
      </div>
    </div>
  );
};
