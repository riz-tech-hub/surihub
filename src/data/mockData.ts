import { PantryItem, PresetIngredient, Recipe, MealPlanDay, BatchPrepItem, CleaningTask, QuickTask } from '@/types';
import { getFutureDateStr } from '@/utils/helpers';

export const PRESET_INGREDIENTS: PresetIngredient[] = [
  { name: 'Bawang Merah', category: 'Bahan Basah', defaultQuantity: '1 kg', defaultDaysToExpiry: 10, emoji: '🧅' },
  { name: 'Bawang Putih', category: 'Bahan Basah', defaultQuantity: '500g', defaultDaysToExpiry: 14, emoji: '🧄' },
  { name: 'Ayam', category: 'Bahan Basah', defaultQuantity: '1 ekor', defaultDaysToExpiry: 2, emoji: '🍗' },
  { name: 'Santan Kotak', category: 'Bahan Kering', defaultQuantity: '2 kotak', defaultDaysToExpiry: 30, emoji: '🥥' },
  { name: 'Cili Kisar', category: 'Pes/Rempah', defaultQuantity: '1 bekas', defaultDaysToExpiry: 5, emoji: '🌶️' },
  { name: 'Halia', category: 'Bahan Basah', defaultQuantity: '200g', defaultDaysToExpiry: 7, emoji: '🫚' },
  { name: 'Serai', category: 'Bahan Basah', defaultQuantity: '5 batang', defaultDaysToExpiry: 7, emoji: '🌱' },
  { name: 'Daging Lembu', category: 'Bahan Basah', defaultQuantity: '500g', defaultDaysToExpiry: 3, emoji: '🥩' },
  { name: 'Ikan Kembung', category: 'Bahan Basah', defaultQuantity: '1 kg', defaultDaysToExpiry: 2, emoji: '🐟' },
  { name: 'Udang', category: 'Bahan Basah', defaultQuantity: '500g', defaultDaysToExpiry: 1, emoji: '🦐' },
  { name: 'Kicap Manis', category: 'Bahan Kering', defaultQuantity: '1 botol', defaultDaysToExpiry: 90, emoji: '🍾' },
  { name: 'Sos Tiram', category: 'Bahan Kering', defaultQuantity: '1 botol', defaultDaysToExpiry: 90, emoji: '🥫' },
  { name: 'Telur Gred A', category: 'Bahan Basah', defaultQuantity: '10 biji', defaultDaysToExpiry: 12, emoji: '🥚' },
  { name: 'Minyak Masak', category: 'Bahan Kering', defaultQuantity: '2 Liter', defaultDaysToExpiry: 180, emoji: '🛢️' },
  { name: 'Pes Tomyam', category: 'Pes/Rempah', defaultQuantity: '1 peket', defaultDaysToExpiry: 45, emoji: '🍲' },
  { name: 'Rempah Kari Ayam', category: 'Pes/Rempah', defaultQuantity: '2 peket', defaultDaysToExpiry: 60, emoji: '🥘' },
  { name: 'Asam Jawa', category: 'Bahan Kering', defaultQuantity: '1 bekas', defaultDaysToExpiry: 120, emoji: '🟤' },
];

export const INITIAL_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'pantry-1',
    name: 'Ayam Segar',
    category: 'Bahan Basah',
    quantity: '1 ekor',
    expiryDate: getFutureDateStr(1), // Red: 1 day left
    addedDate: getFutureDateStr(-2),
    notes: 'Dipotong 12, simpan dalam freezer',
  },
  {
    id: 'pantry-2',
    name: 'Udang Harimau',
    category: 'Bahan Basah',
    quantity: '500g',
    expiryDate: getFutureDateStr(2), // Red: 2 days left
    addedDate: getFutureDateStr(-1),
    notes: 'Untuk masak sambal tumis',
  },
  {
    id: 'pantry-3',
    name: 'Cili Kisar Kak Nab',
    category: 'Pes/Rempah',
    quantity: '1 bekas',
    expiryDate: getFutureDateStr(4), // Yellow: 4 days left
    addedDate: getFutureDateStr(-3),
    notes: 'Telah direbus & diblend',
  },
  {
    id: 'pantry-4',
    name: 'Santan Kotak Ayam Brand',
    category: 'Bahan Kering',
    quantity: '2 kotak',
    expiryDate: getFutureDateStr(5), // Yellow: 5 days left
    addedDate: getFutureDateStr(-5),
  },
  {
    id: 'pantry-5',
    name: 'Bawang Merah Kecil',
    category: 'Bahan Basah',
    quantity: '1 kg',
    expiryDate: getFutureDateStr(10), // Green
    addedDate: getFutureDateStr(-1),
  },
  {
    id: 'pantry-6',
    name: 'Bawang Putih',
    category: 'Bahan Basah',
    quantity: '500g',
    expiryDate: getFutureDateStr(14), // Green
    addedDate: getFutureDateStr(-1),
  },
  {
    id: 'pantry-7',
    name: 'Rempah Kari Ayam Cap Babas',
    category: 'Pes/Rempah',
    quantity: '2 peket',
    expiryDate: getFutureDateStr(60), // Green
    addedDate: getFutureDateStr(-10),
  },
  {
    id: 'pantry-8',
    name: 'Telur Ayam Gred A',
    category: 'Bahan Basah',
    quantity: '10 biji',
    expiryDate: getFutureDateStr(12), // Green
    addedDate: getFutureDateStr(-2),
  },
  {
    id: 'pantry-9',
    name: 'Kicap Manis Jawi',
    category: 'Bahan Kering',
    quantity: '1 botol',
    expiryDate: getFutureDateStr(90), // Green
    addedDate: getFutureDateStr(-15),
  },
];

export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    name: 'Ayam Masak Merah Simpel',
    description: 'Ayam goreng kunyit ditumis bersama cili kisar dan sos tiram. Lazat dan cepat siap.',
    prepTime: '25 min',
    category: 'Lauk Utama',
    imageEmoji: '🍗',
    requiredIngredients: [
      { name: 'Ayam Segar', requiredQty: '1/2 ekor' },
      { name: 'Cili Kisar Kak Nab', requiredQty: '3 sudu besar' },
      { name: 'Bawang Merah Kecil', requiredQty: '5 biji' },
      { name: 'Bawang Putih', requiredQty: '3 ulas' },
    ],
    instructions: [
      'Garam dan kunyitkan ayam, kemudian goreng 3/4 masak.',
      'Kisar atau tumbuk bawang merah dan bawang putih.',
      'Tumis cili kisar bersama bawang hingga pecah minyak.',
      'Masukkan sos tiram, sedikit gula dan garam secukup rasa.',
      'Masukkan ayam goreng, gaul rata dan biarkan kuah pekat.'
    ]
  },
  {
    id: 'rec-2',
    name: 'Kari Ayam Santan Melekit',
    description: 'Kari ayam pekat tradisi dengan aroma rempah dan santan segar.',
    prepTime: '35 min',
    category: 'Lauk Utama',
    imageEmoji: '🥘',
    requiredIngredients: [
      { name: 'Ayam Segar', requiredQty: '1 ekor' },
      { name: 'Rempah Kari Ayam Cap Babas', requiredQty: '1 peket' },
      { name: 'Santan Kotak Ayam Brand', requiredQty: '1 kotak' },
      { name: 'Bawang Merah Kecil', requiredQty: '6 biji' },
      { name: 'Bawang Putih', requiredQty: '4 ulas' },
    ],
    instructions: [
      'Bancuh rempah kari dengan sedikit air hingga jadi pes.',
      'Tumis bawang merah, bawang putih dan daun kari hingga wangi.',
      'Masukkan pes kari dan tumis hingga garing & pecah minyak.',
      'Masukkan ayam dan sedikit air, masak hingga ayam empuk.',
      'Tuang santan, kacau perlahan hingga mendidih dan pekat.'
    ]
  },
  {
    id: 'rec-3',
    name: 'Sambal Tumis Udang Petai',
    description: 'Sambal tumis udang manis pedas kegemaran keluarga.',
    prepTime: '20 min',
    category: 'Sambal/Pes',
    imageEmoji: '🦐',
    requiredIngredients: [
      { name: 'Udang Harimau', requiredQty: '500g' },
      { name: 'Cili Kisar Kak Nab', requiredQty: '4 sudu besar' },
      { name: 'Bawang Merah Kecil', requiredQty: '6 biji' },
    ],
    instructions: [
      'Bersihkan udang dan toskan.',
      'Tumis bawang merah hiris dan cili kisar hingga garing.',
      'Perasakan dengan garam dan gula melaka/pasir.',
      'Masukkan udang, masak kira-kira 3-5 minit sahaja agar udang tetap manis.',
      'Sedia dihidang hangat!'
    ]
  },
  {
    id: 'rec-4',
    name: 'Nasi Goreng Kampung',
    description: 'Nasi goreng mudah guna telur dan ikan bilis/bawang.',
    prepTime: '15 min',
    category: 'Sarapan',
    imageEmoji: '🍳',
    requiredIngredients: [
      { name: 'Telur Ayam Gred A', requiredQty: '2 biji' },
      { name: 'Bawang Merah Kecil', requiredQty: '4 biji' },
      { name: 'Bawang Putih', requiredQty: '2 ulas' },
    ],
    instructions: [
      'Tumbuk kasar bawang merah, bawang putih dan cili padi.',
      'Tumis bahan tumbuk hingga wangi.',
      'Pecahkan telur, pecah-pecahkan dalam kuali.',
      'Masukkan nasi sejuk, garam, dan gaul sebati atas api besar.'
    ]
  },
  {
    id: 'rec-5',
    name: 'Daging Masak Kicap Berempah',
    description: 'Daging empuk bersalut kicap pekat dan aroma halia.',
    prepTime: '30 min',
    category: 'Lauk Utama',
    imageEmoji: '🥩',
    requiredIngredients: [
      { name: 'Daging Lembu', requiredQty: '500g' },
      { name: 'Kicap Manis Jawi', requiredQty: '4 sudu besar' },
      { name: 'Bawang Merah Kecil', requiredQty: '5 biji' },
      { name: 'Bawang Putih', requiredQty: '3 ulas' },
    ],
    instructions: [
      'Rebus daging hingga empuk terlebih dahulu.',
      'Tumis bawang merah, bawang putih dan halia hiris.',
      'Masukkan daging dan tuang kicap manis serta kicap asin.',
      'Kacau hingga kuah pekat bersalut pada daging.'
    ]
  }
];

export const INITIAL_MEAL_PLAN: MealPlanDay[] = [
  { day: 'Isnin', sarapan: 'Nasi Goreng Kampung', makanTengahHari: 'Ayam Masak Merah Simpel & Ulam', makanMalam: 'Sup Ayam & Telur Dadar' },
  { day: 'Selasa', sarapan: 'Cekodok Bikin & Kopi', makanTengahHari: 'Kari Ayam Santan Melekit', makanMalam: 'Telur Kicap & Sambal' },
  { day: 'Rabu', sarapan: 'Roti Canai Frozen', makanTengahHari: 'Sambal Tumis Udang Petai', makanMalam: 'Daging Masak Kicap' },
  { day: 'Khamis', sarapan: 'Mee Goreng Bodoh', makanTengahHari: 'Ikan Kembung Goreng Kunyit', makanMalam: 'Sup Daging & Sayur Campur' },
  { day: 'Jumaat', sarapan: 'Nasi Lemak Simple Kak Nab', makanTengahHari: 'Asam Pedas Ikan', makanMalam: 'Ayam Goreng Berempah' },
  { day: 'Sabtu', sarapan: 'Lempeng Kelapa & Sambal', makanTengahHari: 'Nasi Minyak & Ayam Ros', makanMalam: 'Mee Hailam Special' },
  { day: 'Ahad', sarapan: 'Soto Ayam', makanTengahHari: 'Gulai Kawah Daging', makanMalam: 'Pizza Home-made' },
];

export const INITIAL_BATCH_PREP: BatchPrepItem[] = [
  { id: 'bp-1', task: 'Kopek & Kisar Bawang Merah + Bawang Putih (Simpan Bekas Kaca)', category: 'Pes & Tumisan', completed: true },
  { id: 'bp-2', task: 'Rebus Cili Kering & Kisar Pes Cili (Letak Sedikit Minyak)', category: 'Pes & Tumisan', completed: true },
  { id: 'bp-3', task: 'Perap Ayam dengan Garam & Kunyit untuk 3 Hari', category: 'Bahan Basah', completed: false },
  { id: 'bp-4', task: 'Potong & Cuci Sayur Hard-stem (Lobak, Kubis - Balut Tisu Lembap)', category: 'Sayur-sayuran', completed: false },
  { id: 'bp-5', task: 'Rebus & Kopek Telur untuk Stok Sambal / Nasi Lemak', category: 'Bahan Basah', completed: false },
  { id: 'bp-6', task: 'Simpan Daun Sup & Daun Bawang dalam Bekas Berisi Air', category: 'Sayur-sayuran', completed: false },
];

export const INITIAL_CLEANING_TASKS: CleaningTask[] = [
  // Dapur
  { id: 'cl-1', title: 'Lap kaunter dapur & dapur gas', zone: 'Dapur', completed: true, estimatedMinutes: 10 },
  { id: 'cl-2', title: 'Buang sampah dapur & tukar plastik', zone: 'Dapur', completed: true, estimatedMinutes: 5 },
  { id: 'cl-3', title: 'Sapu & mop lantai dapur', zone: 'Dapur', completed: false, estimatedMinutes: 15 },
  { id: 'cl-4', title: 'Cuci sinki & lap hingga kering', zone: 'Dapur', completed: false, estimatedMinutes: 8 },

  // Ruang Tamu
  { id: 'cl-5', title: 'Kemas kusyen sofa & selimut', zone: 'Ruang Tamu', completed: true, estimatedMinutes: 5 },
  { id: 'cl-6', title: 'Sapu lantai & vacuum karpet', zone: 'Ruang Tamu', completed: false, estimatedMinutes: 12 },
  { id: 'cl-7', title: 'Lap meja kopi & kabinet TV', zone: 'Ruang Tamu', completed: false, estimatedMinutes: 8 },
  { id: 'cl-8', title: 'Susun kasut di rak pintu depan', zone: 'Ruang Tamu', completed: true, estimatedMinutes: 5 },

  // Bilik Air
  { id: 'cl-9', title: 'Cuci mangkuk tandas & sinki', zone: 'Bilik Air', completed: false, estimatedMinutes: 10 },
  { id: 'cl-10', title: 'Sental lantai bilik air', zone: 'Bilik Air', completed: false, estimatedMinutes: 15 },
  { id: 'cl-11', title: 'Tukar tuala mandi basah', zone: 'Bilik Air', completed: true, estimatedMinutes: 3 },
  { id: 'cl-12', title: 'Lap cermin & isi semula sabun', zone: 'Bilik Air', completed: false, estimatedMinutes: 5 },

  // Bilik Tidur
  { id: 'cl-13', title: 'Kemas katil & tegangkan cadar', zone: 'Bilik Tidur', completed: true, estimatedMinutes: 5 },
  { id: 'cl-14', title: 'Lipat baju bersih dari jemuran', zone: 'Bilik Tidur', completed: false, estimatedMinutes: 15 },
  { id: 'cl-15', title: 'Vacuum / sapu lantai bilik tidur', zone: 'Bilik Tidur', completed: false, estimatedMinutes: 10 },
  { id: 'cl-16', title: 'Lap habuk meja solek & komod', zone: 'Bilik Tidur', completed: false, estimatedMinutes: 5 },
];

export const QUICK_5MIN_TASKS: QuickTask[] = [
  { id: 'qt-1', title: 'Kemas Katil & Rapikan Bantal', minutes: 2, iconEmoji: '🛏️', completed: false },
  { id: 'qt-2', title: 'Basuh Pinggan Mangkuk di Sinki', minutes: 5, iconEmoji: '🍽️', completed: false },
  { id: 'qt-3', title: 'Lap Meja Makan Selepas Makan', minutes: 3, iconEmoji: '🧹', completed: false },
  { id: 'qt-4', title: 'Buang Sampah Utama ke Luar', minutes: 2, iconEmoji: '🗑️', completed: false },
  { id: 'qt-5', title: 'Siram Pokok Bunga Halaman', minutes: 4, iconEmoji: '🪴', completed: false },
  { id: 'qt-6', title: 'Lipat 1 Bakul Baju Kering', minutes: 5, iconEmoji: '🧺', completed: false },
  { id: 'qt-7', title: 'Lap Skrin TV & Cermin Muka', minutes: 3, iconEmoji: '🪞', completed: false },
  { id: 'qt-8', title: 'Susun Kasut Depan Pintu Masuk', minutes: 2, iconEmoji: '👟', completed: false },
];
