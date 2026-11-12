export interface StoreLocation {
  id: string;
  name: string;
  badge: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  manager: string;
  techniciansCount: number;
  activeTickets: number;
  dailyRevenue: number;
  isOpen: boolean;
  hours: string;
  gmbUrl: string;
}

export interface RepairTicket {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceCategory: 'smartphone' | 'tablet' | 'computer' | 'console';
  deviceBrand: string;
  deviceModel: string;
  deviceColor: string;
  serialOrImei: string;
  issueDescription: string;
  diagnosticNotes?: string;
  status: 'intake' | 'diagnostic' | 'in_progress' | 'ready' | 'delivered';
  priority: 'normal' | 'high' | 'urgent';
  storeId: string;
  technicianName: string;
  technicianAvatar: string;
  partsRequired: string[];
  quotedPrice: number;
  isPaid: boolean;
  createdAt: string;
  estimatedCompletion: string;
  turnaroundEstimate: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Screen' | 'Battery' | 'Charging Port' | 'Logic Board IC' | 'Housing/Glass' | 'Accessory';
  brand: 'Apple' | 'Samsung' | 'Google' | 'Sony' | 'Universal';
  compatibleDevices: string[];
  stockQuantity: number;
  minThreshold: number;
  unitCost: number;
  retailPrice: number;
  storeAllocations: {
    'store-52nd': number;
    'store-4016': number;
    'store-4060': number;
  };
  supplier: string;
  lastRestocked: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredStore: string;
  totalRepairs: number;
  totalSpent: number;
  lastVisit: string;
  devices: string[];
  activeWarranty: boolean;
}

export const STORES_DATA: StoreLocation[] = [
  {
    id: 'store-52nd',
    name: 'SmartFoneDoctor (Flagship)',
    badge: 'Philadelphia Store #1',
    address: '33 S 52nd St',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19139',
    phone: '(215) 598-2090',
    manager: 'Dr. Mike (Master Tech)',
    techniciansCount: 3,
    activeTickets: 8,
    dailyRevenue: 1140,
    isOpen: true,
    hours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    gmbUrl: 'https://share.google/gTlyWLewR88ToAdJQ',
  },
  {
    id: 'store-4016',
    name: 'Smart Fone Doctor - Lancaster #1',
    badge: 'Philadelphia Store #2',
    address: '4016 Lancaster Ave',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19104',
    phone: '(215) 598-2090',
    manager: 'Sarah Jenkins',
    techniciansCount: 2,
    activeTickets: 4,
    dailyRevenue: 520,
    isOpen: true,
    hours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    gmbUrl: 'https://share.google/gTlyWLewR88ToAdJQ',
  },
  {
    id: 'store-4060',
    name: 'Smart FoneDoctor - Lancaster #2',
    badge: 'Philadelphia Store #3',
    address: '4060 Lancaster Ave',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19104',
    phone: '(215) 598-2090',
    manager: 'Alex Rivera',
    techniciansCount: 1,
    activeTickets: 2,
    dailyRevenue: 320,
    isOpen: true,
    hours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    gmbUrl: 'https://share.google/gTlyWLewR88ToAdJQ',
  },
];

export const INITIAL_TICKETS: RepairTicket[] = [
  {
    id: 'SFD-9842',
    customerName: 'Marcus Bennett',
    customerPhone: '(215) 555-0142',
    customerEmail: 'marcus.b@gmail.com',
    deviceCategory: 'smartphone',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 15 Pro',
    deviceColor: 'Natural Titanium',
    serialOrImei: '358920194829103',
    issueDescription: 'Cracked OLED screen after drop + battery health degraded to 76%',
    diagnosticNotes: 'Display glass shattered, digitizer touch erratic on bottom third. Battery cycled 842 times.',
    status: 'in_progress',
    priority: 'high',
    storeId: 'store-52nd',
    technicianName: 'Dr. Mike',
    technicianAvatar: 'DM',
    partsRequired: ['OEM iPhone 15 Pro Super Retina OLED', 'OEM 3274mAh High-Cap Battery'],
    quotedPrice: 289.0,
    isPaid: false,
    createdAt: 'Today, 11:30 AM',
    estimatedCompletion: 'Today, 4:30 PM',
    turnaroundEstimate: '35 mins remaining',
  },
  {
    id: 'SFD-9843',
    customerName: 'Alicia Keys-Wood',
    customerPhone: '(267) 555-8391',
    customerEmail: 'alicia.w@outlook.com',
    deviceCategory: 'computer',
    deviceBrand: 'Apple',
    deviceModel: 'MacBook Pro 16" M2',
    deviceColor: 'Space Gray',
    serialOrImei: 'C02G80P1MD6R',
    issueDescription: 'Liquid spill on keyboard, device does not power on (Logic Board inspection)',
    diagnosticNotes: 'Corrosion identified on PPBUS_G3H rail capacitor C7050. Ultrasonic bath and microsoldering required.',
    status: 'diagnostic',
    priority: 'urgent',
    storeId: 'store-52nd',
    technicianName: 'Sarah Jenkins',
    technicianAvatar: 'SJ',
    partsRequired: ['ISL9240 Charging IC', 'Ultrasonic Deoxidizer Bath'],
    quotedPrice: 349.0,
    isPaid: true,
    createdAt: 'Today, 09:45 AM',
    estimatedCompletion: 'Tomorrow, 1:00 PM',
    turnaroundEstimate: 'In Diagnostic Test',
  },
  {
    id: 'SFD-9844',
    customerName: 'Jamal Crawford',
    customerPhone: '(215) 555-3921',
    customerEmail: 'jamal.c@phillyrealty.com',
    deviceCategory: 'smartphone',
    deviceBrand: 'Samsung',
    deviceModel: 'Galaxy S24 Ultra',
    deviceColor: 'Titanium Gray',
    serialOrImei: '990012398471201',
    issueDescription: 'Display black with flashing green lines after drop. S-Pen sensor unresponsive.',
    diagnosticNotes: 'Dynamic AMOLED matrix destroyed. Frame intact, middle chassis straight.',
    status: 'ready',
    priority: 'normal',
    storeId: 'store-4016',
    technicianName: 'Alex Rivera',
    technicianAvatar: 'AR',
    partsRequired: ['Genuine S24 Ultra Service Pack AMOLED + Frame'],
    quotedPrice: 299.0,
    isPaid: true,
    createdAt: 'Today, 10:15 AM',
    estimatedCompletion: 'Ready for Pickup',
    turnaroundEstimate: 'Completed',
  },
  {
    id: 'SFD-9845',
    customerName: 'Devon Miller',
    customerPhone: '(267) 555-1940',
    customerEmail: 'devon.m@temple.edu',
    deviceCategory: 'console',
    deviceBrand: 'Sony',
    deviceModel: 'PlayStation 5 Slim',
    deviceColor: 'White',
    serialOrImei: 'AK1928471029',
    issueDescription: 'HDMI port pins bent inside, white light on power button but No Signal on TV.',
    diagnosticNotes: 'Clean port desolder needed. Retimer IC tested fine on oscilloscope.',
    status: 'in_progress',
    priority: 'normal',
    storeId: 'store-52nd',
    technicianName: 'Dr. Mike',
    technicianAvatar: 'DM',
    partsRequired: ['OEM PS5 Replacement HDMI 2.1 Jack', 'Thermal Grizzly Liquid Metal'],
    quotedPrice: 129.0,
    isPaid: false,
    createdAt: 'Today, 12:10 PM',
    estimatedCompletion: 'Today, 5:00 PM',
    turnaroundEstimate: '45 mins remaining',
  },
  {
    id: 'SFD-9846',
    customerName: 'Tasha Higgins',
    customerPhone: '(215) 555-7729',
    customerEmail: 'tashah@gmail.com',
    deviceCategory: 'tablet',
    deviceBrand: 'Apple',
    deviceModel: 'iPad Pro 11" 4th Gen',
    deviceColor: 'Silver',
    serialOrImei: 'DMPZK899P002',
    issueDescription: 'Cracked front digitizer screen. Touch works partially.',
    diagnosticNotes: 'LCD panel unaffected, digitizer glass fractured near front sensor array.',
    status: 'intake',
    priority: 'normal',
    storeId: 'store-4060',
    technicianName: 'Unassigned',
    technicianAvatar: 'UN',
    partsRequired: ['iPad Pro 11" Digitizer Assembly Glass'],
    quotedPrice: 169.0,
    isPaid: false,
    createdAt: 'Today, 01:20 PM',
    estimatedCompletion: 'Today, 6:30 PM',
    turnaroundEstimate: 'Awaiting Diagnostic',
  },
  {
    id: 'SFD-9847',
    customerName: 'Robert Vance',
    customerPhone: '(215) 555-9012',
    customerEmail: 'bobvance@vancerefrig.com',
    deviceCategory: 'smartphone',
    deviceBrand: 'Google',
    deviceModel: 'Pixel 9 Pro',
    deviceColor: 'Porcelain',
    serialOrImei: '352910294821039',
    issueDescription: 'Rear camera glass shattered, main 50MP sensor has focus blur error.',
    diagnosticNotes: 'Dust entered telephoto chamber. New rear camera module assembly required.',
    status: 'ready',
    priority: 'normal',
    storeId: 'store-52nd',
    technicianName: 'Sarah Jenkins',
    technicianAvatar: 'SJ',
    partsRequired: ['Pixel 9 Pro Triple Camera Module + Sapphire Glass'],
    quotedPrice: 179.0,
    isPaid: true,
    createdAt: 'Today, 08:30 AM',
    estimatedCompletion: 'Ready for Pickup',
    turnaroundEstimate: 'Completed',
  },
  {
    id: 'SFD-9848',
    customerName: 'Elena Rostova',
    customerPhone: '(267) 555-4819',
    customerEmail: 'elena.rostova@upenn.edu',
    deviceCategory: 'smartphone',
    deviceBrand: 'Apple',
    deviceModel: 'iPhone 14',
    deviceColor: 'Midnight',
    serialOrImei: '351982739182390',
    issueDescription: 'Rapid battery drain from 100% to 15% in 2 hours. Device gets hot during charging.',
    diagnosticNotes: 'Battery capacity 68%. Tested power draw on USB-C ammeter: 2.1A stable.',
    status: 'delivered',
    priority: 'normal',
    storeId: 'store-4016',
    technicianName: 'Alex Rivera',
    technicianAvatar: 'AR',
    partsRequired: ['OEM 3279mAh iPhone 14 Battery Pack'],
    quotedPrice: 79.0,
    isPaid: true,
    createdAt: 'Yesterday, 03:00 PM',
    estimatedCompletion: 'Delivered',
    turnaroundEstimate: 'Delivered & Paid',
  },
];

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'PART-001',
    sku: 'SCR-IP15P-OLED',
    name: 'Apple iPhone 15 Pro OLED Display Assembly (OEM Spec)',
    category: 'Screen',
    brand: 'Apple',
    compatibleDevices: ['iPhone 15 Pro'],
    stockQuantity: 4,
    minThreshold: 3,
    unitCost: 110.0,
    retailPrice: 249.0,
    storeAllocations: {
      'store-52nd': 2,
      'store-4016': 1,
      'store-4060': 1,
    },
    supplier: 'MobileSentrix Direct',
    lastRestocked: '2026-11-01',
  },
  {
    id: 'PART-002',
    sku: 'BAT-IP15P-3274',
    name: 'iPhone 15 Pro Replacement Battery (3274mAh, 0-Cycle)',
    category: 'Battery',
    brand: 'Apple',
    compatibleDevices: ['iPhone 15 Pro'],
    stockQuantity: 8,
    minThreshold: 4,
    unitCost: 19.5,
    retailPrice: 69.0,
    storeAllocations: {
      'store-52nd': 5,
      'store-4016': 2,
      'store-4060': 1,
    },
    supplier: 'InjuredGadgets Supply',
    lastRestocked: '2026-10-28',
  },
  {
    id: 'PART-003',
    sku: 'SCR-S24U-OCTA',
    name: 'Samsung Galaxy S24 Ultra Dynamic AMOLED + Frame',
    category: 'Screen',
    brand: 'Samsung',
    compatibleDevices: ['Galaxy S24 Ultra (SM-S928U)'],
    stockQuantity: 2,
    minThreshold: 3,
    unitCost: 165.0,
    retailPrice: 299.0,
    storeAllocations: {
      'store-52nd': 1,
      'store-4016': 1,
      'store-4060': 0,
    },
    supplier: 'Samsung Authorized Parts',
    lastRestocked: '2026-10-25',
  },
  {
    id: 'PART-004',
    sku: 'CHG-PS5-HDMI21',
    name: 'PlayStation 5 Slim OEM HDMI 2.1 Jack Port Connector',
    category: 'Charging Port',
    brand: 'Sony',
    compatibleDevices: ['PS5 Disc Edition', 'PS5 Digital', 'PS5 Slim'],
    stockQuantity: 12,
    minThreshold: 5,
    unitCost: 4.8,
    retailPrice: 45.0,
    storeAllocations: {
      'store-52nd': 8,
      'store-4016': 2,
      'store-4060': 2,
    },
    supplier: 'ConsoleParts Depot',
    lastRestocked: '2026-10-15',
  },
  {
    id: 'PART-005',
    sku: 'IC-ISL9240-MAC',
    name: 'Intersil ISL9240 SMBus Battery Charger IC (MacBook Logic)',
    category: 'Logic Board IC',
    brand: 'Apple',
    compatibleDevices: ['MacBook Pro 13/15/16', 'MacBook Air M1/M2'],
    stockQuantity: 5,
    minThreshold: 2,
    unitCost: 7.2,
    retailPrice: 65.0,
    storeAllocations: {
      'store-52nd': 4,
      'store-4016': 1,
      'store-4060': 0,
    },
    supplier: 'Mouser Electronics',
    lastRestocked: '2026-09-19',
  },
  {
    id: 'PART-006',
    sku: 'SCR-IP14-INC',
    name: 'Apple iPhone 14 Incell Display Assembly',
    category: 'Screen',
    brand: 'Apple',
    compatibleDevices: ['iPhone 14'],
    stockQuantity: 1,
    minThreshold: 3,
    unitCost: 42.0,
    retailPrice: 119.0,
    storeAllocations: {
      'store-52nd': 1,
      'store-4016': 0,
      'store-4060': 0,
    },
    supplier: 'MobileSentrix Direct',
    lastRestocked: '2026-10-10',
  },
];

export const CUSTOMER_RECORDS: CustomerRecord[] = [
  {
    id: 'CUST-101',
    name: 'Marcus Bennett',
    phone: '(215) 555-0142',
    email: 'marcus.b@gmail.com',
    preferredStore: '33 S 52nd St (Flagship)',
    totalRepairs: 3,
    totalSpent: 538.0,
    lastVisit: '2026-11-04',
    devices: ['iPhone 15 Pro', 'iPad Air 4'],
    activeWarranty: true,
  },
  {
    id: 'CUST-102',
    name: 'Alicia Keys-Wood',
    phone: '(267) 555-8391',
    email: 'alicia.w@outlook.com',
    preferredStore: '33 S 52nd St (Flagship)',
    totalRepairs: 2,
    totalSpent: 478.0,
    lastVisit: '2026-11-04',
    devices: ['MacBook Pro 16" M2'],
    activeWarranty: true,
  },
  {
    id: 'CUST-103',
    name: 'Jamal Crawford',
    phone: '(215) 555-3921',
    email: 'jamal.c@phillyrealty.com',
    preferredStore: '4016 Lancaster Ave',
    totalRepairs: 4,
    totalSpent: 712.0,
    lastVisit: '2026-11-04',
    devices: ['Galaxy S24 Ultra', 'Galaxy Watch 6'],
    activeWarranty: true,
  },
  {
    id: 'CUST-104',
    name: 'Devon Miller',
    phone: '(267) 555-1940',
    email: 'devon.m@temple.edu',
    preferredStore: '33 S 52nd St (Flagship)',
    totalRepairs: 1,
    totalSpent: 129.0,
    lastVisit: '2026-11-04',
    devices: ['PlayStation 5 Slim'],
    activeWarranty: true,
  },
  {
    id: 'CUST-105',
    name: 'Robert Vance',
    phone: '(215) 555-9012',
    email: 'bobvance@vancerefrig.com',
    preferredStore: '33 S 52nd St (Flagship)',
    totalRepairs: 5,
    totalSpent: 890.0,
    lastVisit: '2026-11-04',
    devices: ['Pixel 9 Pro', 'Pixel Tablet', 'iPhone 13'],
    activeWarranty: true,
  },
];

