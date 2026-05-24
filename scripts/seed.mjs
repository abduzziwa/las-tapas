/**
 * Las Tapas — Database seed script
 * Run: npm run seed
 *
 * Resets and repopulates: tables, menu, employees, paymentconfig
 * Also inserts demo sessions + orders to exercise every screen.
 */

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/';
const DB_NAME = 'LAS_TAAPS';

// ─── helpers ────────────────────────────────────────────────────────────────

function ts(minutesAgo = 0) {
  return new Date(Date.now() - minutesAgo * 60 * 1000);
}

function sid(tag) {
  return `s${tag}demo${Math.random().toString(36).slice(2, 8)}`;
}

// ─── tables ─────────────────────────────────────────────────────────────────

const TABLES = [
  { tableNumber: 'T1', seats: 2,  status: 'available', occupiedBy: [] },
  { tableNumber: 'T2', seats: 2,  status: 'available', occupiedBy: [] },
  { tableNumber: 'T3', seats: 4,  status: 'available', occupiedBy: [] },
  { tableNumber: 'T4', seats: 4,  status: 'available', occupiedBy: [] },
  { tableNumber: 'T5', seats: 4,  status: 'available', occupiedBy: [] },
  { tableNumber: 'T6', seats: 6,  status: 'available', occupiedBy: [] },
  { tableNumber: 'T7', seats: 6,  status: 'available', occupiedBy: [] },
  { tableNumber: 'T8', seats: 8,  status: 'available', occupiedBy: [] },
];

// ─── menu ────────────────────────────────────────────────────────────────────

const MENU = [
  // ── food ──
  {
    foodId: 'F001', category: 'food', name: 'Patatas Bravas',
    description: 'Knapprige aardappelblokjes met pikante bravas-saus en aioli.',
    price: 5.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['aardappelen', 'tomatensaus', 'paprika', 'knoflook', 'olijfolie'],
  },
  {
    foodId: 'F002', category: 'food', name: 'Croquetas de Jamón',
    description: 'Huisgemaakte kroketten gevuld met Iberische ham en béchamelsaus.',
    price: 6.50, vegetarian: false, halal: false, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['Iberische ham', 'melk', 'bloem', 'boter', 'nootmuskaat', 'paneermeel'],
  },
  {
    foodId: 'F003', category: 'food', name: 'Gambas al Ajillo',
    description: 'Garnalen gebakken in olijfolie met knoflook en rode peper.',
    price: 9.50, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['garnalen', 'knoflook', 'olijfolie', 'rode peper', 'peterselie'],
  },
  {
    foodId: 'F004', category: 'food', name: 'Pan con Tomate',
    description: 'Geroosterd brood ingewreven met rijpe tomaat, knoflook en olijfolie.',
    price: 4.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Catalonië',
    ingredients: ['boerenbrood', 'tomaat', 'knoflook', 'olijfolie', 'zeezout'],
  },
  {
    foodId: 'F005', category: 'food', name: 'Pimientos de Padrón',
    description: 'Gebakken groene paprika\'s uit Galicië, bestrooid met grof zeezout.',
    price: 5.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Galicië',
    ingredients: ['pimientos de Padrón', 'olijfolie', 'zeezout'],
  },
  {
    foodId: 'F006', category: 'food', name: 'Tortilla Española',
    description: 'Klassieke Spaanse aardappelomelet, geserveerd op kamertemperatuur.',
    price: 6.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['ei', 'aardappelen', 'ui', 'olijfolie', 'zout'],
  },
  {
    foodId: 'F007', category: 'food', name: 'Albóndigas en Salsa',
    description: 'Gehaktballetjes gestoord in een rijke tomatensaus.',
    price: 7.50, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['rundergehakt', 'tomaat', 'ui', 'knoflook', 'kruiden'],
  },
  {
    foodId: 'F008', category: 'food', name: 'Pulpo a la Gallega',
    description: 'Zachte octopus met aardappel, paprikapoeder en olijfolie.',
    price: 13.50, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Galicië',
    ingredients: ['octopus', 'aardappelen', 'paprikapoeder', 'olijfolie', 'zeezout'],
  },
  {
    foodId: 'F009', category: 'food', name: 'Jamón Ibérico (50 g)',
    description: 'Dun gesneden Iberische ham, 36 maanden gerijpt.',
    price: 14.00, vegetarian: false, halal: false, alcoholic: false,
    countryOfOrigin: 'Extremadura',
    ingredients: ['Iberische ham'],
  },
  {
    foodId: 'F010', category: 'food', name: 'Calamares a la Romana',
    description: 'Gefrituurde inktvisringen met een knapperig beslag en citroenaioli.',
    price: 8.50, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['inktvis', 'bloem', 'ei', 'citroen', 'aioli'],
  },
  {
    foodId: 'F011', category: 'food', name: 'Boquerones en Vinagre',
    description: 'Verse ansjovis gemarineerd in witte wijnazijn met knoflook en peterselie.',
    price: 7.00, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['verse ansjovis', 'witte wijnazijn', 'knoflook', 'peterselie', 'olijfolie'],
  },
  {
    foodId: 'F012', category: 'food', name: 'Queso Manchego con Membrillo',
    description: 'Manchego kaas (12 maanden) geserveerd met kweepeergelei.',
    price: 8.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'La Mancha',
    ingredients: ['manchego', 'kweepeergelei'],
  },

  // ── drinks ──
  {
    foodId: 'D001', category: 'drink', name: 'Sangría (glas)',
    description: 'Huisgemaakte rode sangría met seizoensfruit.',
    price: 7.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Spanje',
    ingredients: ['rode wijn', 'sinaasappelsap', 'appel', 'limoensap', 'brandy', 'suiker'],
  },
  {
    foodId: 'D002', category: 'drink', name: 'Cerveza Estrella Damm',
    description: 'Spaans bier uit Barcelona — fris en licht.',
    price: 4.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Catalonië',
    ingredients: ['water', 'gerst', 'mout', 'hop'],
  },
  {
    foodId: 'D003', category: 'drink', name: 'Vino Tinto (glas)',
    description: 'Selectie Spaanse rode wijn van de dag.',
    price: 5.50, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Spanje',
    ingredients: ['rode wijn'],
  },
  {
    foodId: 'D004', category: 'drink', name: 'Vino Blanco (glas)',
    description: 'Frisse witte wijn — Albariño of Verdejo.',
    price: 5.50, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Spanje',
    ingredients: ['witte wijn'],
  },
  {
    foodId: 'D005', category: 'drink', name: 'Agua Mineral (0,5 L)',
    description: 'Stille of bruisende mineraalwater.',
    price: 2.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['water'],
  },
  {
    foodId: 'D006', category: 'drink', name: 'Cortado',
    description: 'Espresso met een scheutje gestoomde melk.',
    price: 2.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['espresso', 'melk'],
  },
  {
    foodId: 'D007', category: 'drink', name: 'Tinto de Verano',
    description: 'Rode wijn gemengd met limoen-frisdrank — de zomerse sangría.',
    price: 5.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Spanje',
    ingredients: ['rode wijn', 'limoen-fanta'],
  },
  {
    foodId: 'D008', category: 'drink', name: 'Mojito',
    description: 'Cubaanse klassieker met rum, munt, limoen en bruiswater.',
    price: 8.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Cuba',
    ingredients: ['witte rum', 'munt', 'limoen', 'suikersiroop', 'bruiswater'],
  },
  {
    foodId: 'D009', category: 'drink', name: 'Rioja Crianza (fles)',
    description: 'Volle Rioja Crianza, 14 maanden gerijpt op eiken.',
    price: 26.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Rioja',
    ingredients: ['Tempranillo', 'Garnacha'],
  },
  {
    foodId: 'D010', category: 'drink', name: 'Frisdrank',
    description: 'Cola, Fanta Sinaas, Fanta Citroen of Sprite.',
    price: 2.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Nederland',
    ingredients: ['bruiswater', 'suiker', 'aroma'],
  },

  // ── desserts ──
  {
    foodId: 'DS001', category: 'dessert', name: 'Churros con Chocolate',
    description: 'Knapperige churros met warme pure chocoladesaus.',
    price: 6.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['bloem', 'water', 'ei', 'zout', 'pure chocolade'],
  },
  {
    foodId: 'DS002', category: 'dessert', name: 'Crema Catalana',
    description: 'Romige custard met een gekaramelliseerde suikerkorst.',
    price: 5.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Catalonië',
    ingredients: ['room', 'eidooier', 'suiker', 'kaneel', 'citroenschil'],
  },
  {
    foodId: 'DS003', category: 'dessert', name: 'Flan de Huevo',
    description: 'Klassieke Spaanse karamelkustard, zacht en luchtig.',
    price: 5.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spanje',
    ingredients: ['ei', 'volle melk', 'suiker', 'vanille'],
  },
  {
    foodId: 'DS004', category: 'dessert', name: 'Tarta de Santiago',
    description: 'Amandeltaart uit Galicië, bestrooid met poedersuiker.',
    price: 6.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Galicië',
    ingredients: ['amandelen', 'ei', 'suiker', 'citroenschil', 'kaneel'],
  },
  {
    foodId: 'DS005', category: 'dessert', name: 'Helado de Turrón',
    description: 'Romig turrón-ijs gemaakt van traditionele Spaanse nougat.',
    price: 5.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Alicante',
    ingredients: ['room', 'turrón', 'suiker', 'eidooier'],
  },
];

// ─── employees ───────────────────────────────────────────────────────────────

const EMPLOYEES = [
  {
    employeeId: 'E001',
    name: 'Carlos Mendez',
    email: 'carlos@lastapas.nl',
    role: 'waiter',
    isActive: true,
    shiftDetails: 'Ma–Vr 17:00–23:00',
    createdAt: new Date('2024-01-10'),
  },
  {
    employeeId: 'E002',
    name: 'Ana García',
    email: 'ana@lastapas.nl',
    role: 'waiter',
    isActive: true,
    shiftDetails: 'Di–Za 16:00–22:00',
    createdAt: new Date('2024-02-14'),
  },
  {
    employeeId: 'E003',
    name: 'Jordi López',
    email: 'jordi@lastapas.nl',
    role: 'chef',
    isActive: true,
    shiftDetails: 'Ma–Vr 15:00–23:00',
    createdAt: new Date('2023-11-01'),
  },
  {
    employeeId: 'E004',
    name: 'Miguel Torres',
    email: 'miguel@lastapas.nl',
    role: 'bar',
    isActive: true,
    shiftDetails: 'Do–Za 18:00–02:00',
    createdAt: new Date('2024-03-05'),
  },
  {
    employeeId: 'E005',
    name: 'Sofia Ruiz',
    email: 'sofia@lastapas.nl',
    role: 'admin',
    isActive: true,
    shiftDetails: 'Ma–Vr 09:00–17:00',
    createdAt: new Date('2023-09-01'),
  },
];

// ─── demo sessions & orders ──────────────────────────────────────────────────
// Creates realistic in-progress state across all the main screens.

// Session IDs used in demo orders — kept static so they're predictable
const SESSION = {
  T3_C1: 'sdemo_t3c1_0001',
  T3_C2: 'sdemo_t3c2_0002',
  T5_C1: 'sdemo_t5c1_0003',
  T5_C2: 'sdemo_t5c2_0004',
  T2_C1: 'sdemo_t2c1_0005',
};

const DEMO_SESSIONS = [
  // T3 seat 1 — active, food being prepared
  {
    sessionId: SESSION.T3_C1,
    lastActiveTable: 'T3',
    seatNumber: 'C1',
    guestName: 'Sarah',
    status: 'active',
    createdAt: ts(35),
    lastActiveAt: ts(10),
  },
  // T3 seat 2 — active, just ordered drinks
  {
    sessionId: SESSION.T3_C2,
    lastActiveTable: 'T3',
    seatNumber: 'C2',
    guestName: 'Liam',
    status: 'active',
    createdAt: ts(34),
    lastActiveAt: ts(8),
  },
  // T5 seat 1 — active, food ready
  {
    sessionId: SESSION.T5_C1,
    lastActiveTable: 'T5',
    seatNumber: 'C1',
    guestName: 'Emma',
    status: 'active',
    createdAt: ts(60),
    lastActiveAt: ts(15),
  },
  // T5 seat 2 — active, wants to pay
  {
    sessionId: SESSION.T5_C2,
    lastActiveTable: 'T5',
    seatNumber: 'C2',
    guestName: 'Noah',
    status: 'active',
    createdAt: ts(58),
    lastActiveAt: ts(5),
  },
  // T2 seat 1 — active, order just placed
  {
    sessionId: SESSION.T2_C1,
    lastActiveTable: 'T2',
    seatNumber: 'C1',
    guestName: 'Isabel',
    status: 'active',
    createdAt: ts(12),
    lastActiveAt: ts(2),
  },
];

// Occupied tables matching demo sessions
const DEMO_OCCUPIED_TABLES = {
  T3: [SESSION.T3_C1, SESSION.T3_C2],
  T5: [SESSION.T5_C1, SESSION.T5_C2],
  T2: [SESSION.T2_C1],
};

const DEMO_ORDERS = [
  // ── T3 / Sarah — food order, currently being prepared (shows on chef screen)
  {
    orderId: 1001,
    sessionId: SESSION.T3_C1,
    tableNumber: 'T3',
    seatNumber: 'C1',
    guestName: 'Sarah',
    foodItems: [
      { foodId: 'F003', name: 'Gambas al Ajillo',     quantity: 1, price: 9.50,  category: 'food',  modification: '' },
      { foodId: 'F001', name: 'Patatas Bravas',        quantity: 1, price: 5.50,  category: 'food',  modification: '' },
      { foodId: 'F006', name: 'Tortilla Española',     quantity: 1, price: 6.00,  category: 'food',  modification: 'extra crispy' },
    ],
    status: 'preparing',
    payment: 'unpaid',
    paymentMethod: '',
    timestamps: { orderedAt: ts(25), preparingAt: ts(20) },
  },

  // ── T3 / Liam — drinks order (shows on bar screen)
  {
    orderId: 1002,
    sessionId: SESSION.T3_C2,
    tableNumber: 'T3',
    seatNumber: 'C2',
    guestName: 'Liam',
    foodItems: [
      { foodId: 'D001', name: 'Sangría (glas)',        quantity: 2, price: 7.00,  category: 'drink', modification: '' },
      { foodId: 'D005', name: 'Agua Mineral (0,5 L)',  quantity: 1, price: 2.50,  category: 'drink', modification: 'bruisend' },
    ],
    status: 'ordered',
    payment: 'unpaid',
    paymentMethod: '',
    timestamps: { orderedAt: ts(8) },
  },

  // ── T5 / Emma — mixed order, ready to serve (shows on waiter screen as 'ready')
  {
    orderId: 1003,
    sessionId: SESSION.T5_C1,
    tableNumber: 'T5',
    seatNumber: 'C1',
    guestName: 'Emma',
    foodItems: [
      { foodId: 'F008', name: 'Pulpo a la Gallega',    quantity: 1, price: 13.50, category: 'food',  modification: '' },
      { foodId: 'F004', name: 'Pan con Tomate',         quantity: 2, price: 4.00,  category: 'food',  modification: '' },
      { foodId: 'D003', name: 'Vino Tinto (glas)',      quantity: 2, price: 5.50,  category: 'drink', modification: '' },
    ],
    status: 'ready',
    payment: 'unpaid',
    paymentMethod: '',
    timestamps: { orderedAt: ts(50), preparingAt: ts(42), readyAt: ts(10) },
  },

  // ── T5 / Noah — served order, wants to pay (shows on waiter payment requests)
  {
    orderId: 1004,
    sessionId: SESSION.T5_C2,
    tableNumber: 'T5',
    seatNumber: 'C2',
    guestName: 'Noah',
    foodItems: [
      { foodId: 'F002', name: 'Croquetas de Jamón',    quantity: 2, price: 6.50,  category: 'food',  modification: '' },
      { foodId: 'F009', name: 'Jamón Ibérico (50 g)',  quantity: 1, price: 14.00, category: 'food',  modification: '' },
      { foodId: 'D002', name: 'Cerveza Estrella Damm', quantity: 2, price: 4.00,  category: 'drink', modification: '' },
      { foodId: 'DS002', name: 'Crema Catalana',       quantity: 1, price: 5.50,  category: 'dessert', modification: '' },
    ],
    status: 'served',
    payment: 'wantToPay',
    paymentMethod: '',
    timestamps: { orderedAt: ts(55), preparingAt: ts(48), readyAt: ts(30), servedAt: ts(25) },
  },

  // ── T2 / Isabel — fresh order just placed (shows on chef + bar screens)
  {
    orderId: 1005,
    sessionId: SESSION.T2_C1,
    tableNumber: 'T2',
    seatNumber: 'C1',
    guestName: 'Isabel',
    foodItems: [
      { foodId: 'F005', name: 'Pimientos de Padrón',   quantity: 1, price: 5.50,  category: 'food',  modification: '' },
      { foodId: 'F010', name: 'Calamares a la Romana', quantity: 1, price: 8.50,  category: 'food',  modification: '' },
      { foodId: 'D008', name: 'Mojito',                quantity: 1, price: 8.00,  category: 'drink', modification: 'geen suiker' },
      { foodId: 'D006', name: 'Cortado',               quantity: 1, price: 2.50,  category: 'drink', modification: '' },
    ],
    status: 'ordered',
    payment: 'unpaid',
    paymentMethod: '',
    timestamps: { orderedAt: ts(3) },
  },

  // ── historical paid order — visible in admin payments overview
  {
    orderId: 1000,
    sessionId: 'sdemo_hist_paid',
    tableNumber: 'T6',
    seatNumber: 'C1',
    guestName: 'Thomas',
    foodItems: [
      { foodId: 'F007', name: 'Albóndigas en Salsa',   quantity: 2, price: 7.50,  category: 'food',  modification: '' },
      { foodId: 'F001', name: 'Patatas Bravas',         quantity: 1, price: 5.50,  category: 'food',  modification: '' },
      { foodId: 'D009', name: 'Rioja Crianza (fles)',   quantity: 1, price: 26.00, category: 'drink', modification: '' },
      { foodId: 'DS001', name: 'Churros con Chocolate', quantity: 2, price: 6.00,  category: 'dessert', modification: '' },
    ],
    status: 'served',
    payment: 'paid',
    paymentMethod: 'pin',
    timestamps: { orderedAt: ts(120), preparingAt: ts(110), readyAt: ts(90), servedAt: ts(80) },
  },
];

// ─── payment config ───────────────────────────────────────────────────────────

const PAYMENT_CONFIG = {
  configId: 'singleton',
  tikkieApiKey: '',
  tikkieAppToken: '',
  iban: '',
  accountHolder: 'Las Tapas Restaurant',
  enabledMethods: ['pin', 'cash', 'tikkie'],
  updatedAt: new Date(),
  updatedBy: 'seed',
};

// ─── seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱  Connecting to MongoDB…');
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  const db = mongoose.connection.db;

  // ── tables ──
  await db.collection('tables').deleteMany({});
  // Apply occupied state for demo sessions
  const tables = TABLES.map((t) => {
    const occupiedBy = DEMO_OCCUPIED_TABLES[t.tableNumber] || [];
    return {
      ...t,
      occupiedBy,
      status: occupiedBy.length > 0 ? 'occupied' : 'available',
    };
  });
  await db.collection('tables').insertMany(tables);
  console.log(`✅  tables       — ${tables.length} inserted`);

  // ── menu ──
  await db.collection('menu').deleteMany({});
  await db.collection('menu').insertMany(MENU);
  console.log(`✅  menu         — ${MENU.length} inserted (${MENU.filter(i=>i.category==='food').length} food, ${MENU.filter(i=>i.category==='drink').length} drinks, ${MENU.filter(i=>i.category==='dessert').length} desserts)`);

  // ── employees ──
  await db.collection('employees').deleteMany({});
  await db.collection('employees').insertMany(EMPLOYEES);
  console.log(`✅  employees    — ${EMPLOYEES.length} inserted`);

  // ── sessions (demo only — keep existing non-demo sessions) ──
  await db.collection('sessions').deleteMany({ sessionId: { $regex: '^sdemo_' } });
  await db.collection('sessions').insertMany(DEMO_SESSIONS);
  console.log(`✅  sessions     — ${DEMO_SESSIONS.length} demo sessions inserted`);

  // ── orders (demo only) ──
  await db.collection('orders').deleteMany({ orderId: { $gte: 1000, $lte: 1099 } });
  await db.collection('orders').insertMany(DEMO_ORDERS);
  console.log(`✅  orders       — ${DEMO_ORDERS.length} demo orders inserted`);

  // ── payment config (upsert) ──
  await db.collection('paymentconfig').updateOne(
    { configId: 'singleton' },
    { $setOnInsert: PAYMENT_CONFIG },
    { upsert: true }
  );
  console.log('✅  paymentconfig — singleton upserted (existing credentials preserved)');

  await mongoose.disconnect();

  console.log('');
  console.log('─'.repeat(56));
  console.log('Demo state:');
  console.log('  T2  Isabel  — 1 order just placed (chef + bar)');
  console.log('  T3  Sarah   — food preparing (chef screen)');
  console.log('  T3  Liam    — drinks ordered  (bar screen)');
  console.log('  T5  Emma    — order ready to serve (waiter screen)');
  console.log('  T5  Noah    — served, wants to pay (pay-requests)');
  console.log('  T6  Thomas  — paid via PIN (admin payments overview)');
  console.log('─'.repeat(56));
  console.log('');
  console.log('🚀  Seed complete. Start the app with: npm run dev');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
