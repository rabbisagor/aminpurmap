import { RoadFeature } from '../types';

export const ROADS_DATA: RoadFeature[] = [
  {
    id: 'road-r540-kashinathpur-kazirhat',
    name_bn: 'কাশীনাথপুর – আমিনপুর – কাজিরহাট আঞ্চলিক মহাসড়ক (R540)',
    name_en: 'Kashinathpur - Aminpur - Kazirhat Regional Highway',
    roadType: 'regional',
    surface_bn: 'পাকা (অ্যাসফল্ট)',
    length_km: 14.2,
    description_bn: 'আমিনপুর থানার প্রধান ধমনি। কাশীনাথপুর মোড় থেকে কাজিরহাট ফেরিঘাট পর্যন্ত বিস্তৃত।',
    coordinates: [
      [24.0160, 89.6042],
      [24.0090, 89.6120],
      [24.0010, 89.6210],
      [23.9912, 89.6305], // জাতসাকিনী
      [23.9840, 89.6350],
      [23.9785, 89.6385], // আমিনপুর থানা ও বাজার
      [23.9710, 89.6450],
      [23.9632, 89.6541], // রূপপুর
      [23.9550, 89.6670],
      [23.9490, 89.6780],
      [23.9455, 89.6912], // কাজিরহাট ফেরিঘাট
    ],
  },
  {
    id: 'road-n5-kashinathpur-highway',
    name_bn: 'ঢাকা – পাবনা জাতীয় মহাসড়ক (কাশীনাথপুর অংশ)',
    name_en: 'Dhaka - Pabna National Highway (N5 section)',
    roadType: 'national',
    surface_bn: 'পাকা (জাতীয় মহাসড়ক)',
    length_km: 7.5,
    description_bn: 'কাশীনাথপুর মোড় দিয়ে যাওয়া জাতীয় মহাসড়ক।',
    coordinates: [
      [24.0280, 89.5750],
      [24.0220, 89.5890],
      [24.0160, 89.6042], // কাশীনাথপুর
      [24.0180, 89.6200],
      [24.0200, 89.6400],
    ],
  },
  {
    id: 'road-aminpur-masundia',
    name_bn: 'আমিনপুর – মাসুন্দিয়া সংযোগ সড়ক',
    name_en: 'Aminpur - Masundia Connector Road',
    roadType: 'tertiary',
    surface_bn: 'পাকা',
    length_km: 4.8,
    description_bn: 'আমিনপুর থানা থেকে বাদাই নদী পার হয়ে মাসুন্দিয়া বাজার সংযোগ।',
    coordinates: [
      [23.9785, 89.6385], // আমিনপুর
      [23.9815, 89.6300],
      [23.9850, 89.6200], // বাদাই সেতু
      [23.9810, 89.6170],
      [23.9718, 89.6152], // মাসুন্দিয়া বাজার
    ],
  },
  {
    id: 'road-masundia-raninagar',
    name_bn: 'মাসুন্দিয়া – রানীনগর সড়ক',
    name_en: 'Masundia - Raninagar Road',
    roadType: 'paved',
    surface_bn: 'পাকা',
    length_km: 6.2,
    description_bn: 'মাসুন্দিয়া ইউনিয়ন থেকে রানীনগর ইউনিয়ন পরিষদ সংযোগ সড়ক।',
    coordinates: [
      [23.9718, 89.6152], // মাসুন্দিয়া
      [23.9680, 89.6010],
      [23.9650, 89.5820],
      [23.9654, 89.5582], // রানীনগর
    ],
  },
  {
    id: 'road-raninagar-sagarkandi',
    name_bn: 'রানীনগর – সাগরকান্দি ইউনিয়ন সড়ক',
    name_en: 'Raninagar - Sagarkandi Road',
    roadType: 'paved',
    surface_bn: 'পাকা',
    length_km: 4.5,
    description_bn: 'রানীনগর বাজার থেকে সাগরকান্দি ইউনিয়ন পরিষদ ও বাজার সংযোগ।',
    coordinates: [
      [23.9654, 89.5582], // রানীনগর
      [23.9750, 89.5540],
      [23.9870, 89.5490],
      [23.9978, 89.5430], // সাগরকান্দি
    ],
  },
  {
    id: 'road-sagarkandi-kashinathpur',
    name_bn: 'সাগরকান্দি – আহমেদপুর – কাশীনাথপুর সড়ক',
    name_en: 'Sagarkandi - Ahmedpur - Kashinathpur Link',
    roadType: 'paved',
    surface_bn: 'পাকা গ্রামীণ সড়ক',
    length_km: 8.6,
    description_bn: 'সাগরকান্দি থেকে উত্তরমুখী হয়ে আহমেদপুর ও কাশীনাথপুর সংযোগ।',
    coordinates: [
      [23.9978, 89.5430], // সাগরকান্দি
      [24.0110, 89.5580],
      [24.0220, 89.5750],
      [24.0160, 89.6042], // কাশীনাথপুর
    ],
  },
  {
    id: 'road-ruppur-dhalchar-embankment',
    name_bn: 'রূপপুর – ঢালচর পদ্মা বাঁধ সড়ক (বেড়িবাঁধ)',
    name_en: 'Ruppur - Dhalchar Embankment Road',
    roadType: 'paved',
    surface_bn: 'পাকা বন্যা নিয়ন্ত্রণ বাঁধ সড়ক',
    length_km: 6.8,
    description_bn: 'পদ্মা নদীর তীরবর্তী বন্যা নিয়ন্ত্রণ বাঁধের ওপর দিয়ে যাওয়া সড়ক।',
    coordinates: [
      [23.9632, 89.6541], // রূপপুর
      [23.9520, 89.6450], // সুতিখালি ব্রিজ
      [23.9420, 89.6500],
      [23.9351, 89.6582], // ঢালচর বাজার
    ],
  },
  {
    id: 'road-aminpur-puran-bharenga',
    name_bn: 'আমিনপুর – পুরান ভারেঙ্গা সড়ক',
    name_en: 'Aminpur - Puran Bharenga Road',
    roadType: 'paved',
    surface_bn: 'পাকা',
    length_km: 3.5,
    description_bn: 'আমিনপুর বাজার থেকে পুরান ভারেঙ্গা ইউনিয়ন সংযোগ।',
    coordinates: [
      [23.9785, 89.6385], // আমিনপুর
      [23.9820, 89.6480],
      [23.9850, 89.6550],
      [23.9878, 89.6618], // পুরান ভারেঙ্গা
    ],
  },
  {
    id: 'road-dhalchar-char-path',
    name_bn: 'ঢালচর দক্ষিণাঞ্চল চরের পথ',
    name_en: 'Dhalchar South Riverine Trail',
    roadType: 'unpaved',
    surface_bn: 'কাঁচা বালুর রাস্তা',
    length_km: 2.8,
    description_bn: 'পদ্মার বুকে জেগে ওঠা চরের অভ্যন্তরীণ কাঁচা মেঠোপথ।',
    coordinates: [
      [23.9351, 89.6582],
      [23.9280, 89.6620],
      [23.9210, 89.6680],
    ],
  },
  {
    id: 'waterway-kazirhat-paturia-ferry',
    name_bn: 'কাজিরহাট – পাটুরিয়া নৌ রুট (ফেরি ও লঞ্চপথ)',
    name_en: 'Kazirhat - Paturia Waterway Route',
    roadType: 'waterway',
    surface_bn: 'যমুনা ও পদ্মা নদী ফেরি চ্যানেল',
    length_km: 12.0,
    description_bn: 'কাজিরহাট ফেরিঘাট থেকে মানিকগঞ্জের পাটুরিয়া ঘাটের নৌ সংযোগ।',
    coordinates: [
      [23.9455, 89.6912], // কাজিরহাট ফেরিঘাট
      [23.9400, 89.7050],
      [23.9300, 89.7220],
      [23.9180, 89.7400],
    ],
  },
];
