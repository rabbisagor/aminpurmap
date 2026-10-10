/**
 * অফলাইন ম্যাপ ম্যানেজার ও ডাউনলোড হ্যান্ডলার
 */

import { saveOfflinePack, getOfflinePacks, deleteOfflinePack } from './db';
import { PLACES_DATA } from '../data/placesData';
import { ROADS_DATA } from '../data/roadsData';

export interface DownloadProgress {
  status: 'idle' | 'downloading' | 'completed' | 'error' | 'cancelled';
  percentage: number;
  message_bn: string;
  totalSizeMb: number;
}

export const AMINPUR_OFFLINE_PACK_META = {
  id: 'aminpur-core-pack-v1',
  name_bn: 'আমিনপুর থানা কোর ম্যাপ প্যাক (রাস্তা, স্থান ও সীমানা)',
  version: '1.2.0',
  estimatedSizeMb: 4.8,
  placesCount: PLACES_DATA.length,
  roadsCount: ROADS_DATA.length,
};

let activeDownloadController: AbortController | null = null;

export async function isPackDownloaded(packId: string = AMINPUR_OFFLINE_PACK_META.id): Promise<boolean> {
  const packs = await getOfflinePacks();
  return packs.some((p) => p.id === packId);
}

export async function startDownloadPack(
  onProgress: (progress: DownloadProgress) => void
): Promise<void> {
  activeDownloadController = new AbortController();

  onProgress({
    status: 'downloading',
    percentage: 10,
    message_bn: 'আমিনপুর ভৌগোলিক ডেটা প্রক্রিয়াকরণ শুরু হচ্ছে...',
    totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
  });

  try {
    await delay(350);
    if (activeDownloadController.signal.aborted) throw new Error('cancelled');

    onProgress({
      status: 'downloading',
      percentage: 35,
      message_bn: 'রাস্তা ও সড়ক নেটওয়ার্ক গ্রাফ ডাউনলোড ও ক্যাশ করা হচ্ছে...',
      totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
    });

    await delay(400);
    if (activeDownloadController.signal.aborted) throw new Error('cancelled');

    onProgress({
      status: 'downloading',
      percentage: 65,
      message_bn: 'সকল গুরুত্বপূর্ণ স্থান (POI) ও ইউনিয়ন সীমানা সংরক্ষণ করা হচ্ছে...',
      totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
    });

    await delay(450);
    if (activeDownloadController.signal.aborted) throw new Error('cancelled');

    onProgress({
      status: 'downloading',
      percentage: 88,
      message_bn: 'IndexedDB-তে অফলাইন স্টোরেজ ইনডেক্সিং তৈরি হচ্ছে...',
      totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
    });

    // IndexedDB-তে সংরক্ষণ
    await saveOfflinePack({
      id: AMINPUR_OFFLINE_PACK_META.id,
      name_bn: AMINPUR_OFFLINE_PACK_META.name_bn,
      version: AMINPUR_OFFLINE_PACK_META.version,
      downloadedAt: new Date().toISOString(),
      placesCount: AMINPUR_OFFLINE_PACK_META.placesCount,
      roadsCount: AMINPUR_OFFLINE_PACK_META.roadsCount,
      dataSizeBytes: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb * 1024 * 1024,
    });

    await delay(300);

    onProgress({
      status: 'completed',
      percentage: 100,
      message_bn: 'অফলাইন ম্যাপ ব্যবহারের জন্য প্রস্তুত',
      totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
    });
  } catch (err: any) {
    if (err?.message === 'cancelled') {
      onProgress({
        status: 'cancelled',
        percentage: 0,
        message_bn: 'ডাউনলোড বাতিল করা হয়েছে',
        totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
      });
    } else {
      onProgress({
        status: 'error',
        percentage: 0,
        message_bn: 'ডাউনলোড ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।',
        totalSizeMb: AMINPUR_OFFLINE_PACK_META.estimatedSizeMb,
      });
    }
  } finally {
    activeDownloadController = null;
  }
}

export function cancelDownload(): void {
  if (activeDownloadController) {
    activeDownloadController.abort();
  }
}

export async function removeDownloadedPack(packId: string = AMINPUR_OFFLINE_PACK_META.id): Promise<void> {
  await deleteOfflinePack(packId);
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
