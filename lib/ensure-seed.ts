/**
 * ensure-seed.ts
 * Called by instrumentation.ts on every server start.
 * Uses a separate Mongoose connection (not the cached app connection)
 * so it runs before any request hits the app.
 *
 * Logic:
 *   1. Connect to MongoDB
 *   2. Count documents in `tables` — if > 0, DB already seeded → skip
 *   3. Insert tables, menu, employees, paymentconfig
 *   4. Close the bootstrap connection
 *
 * Seed failures are logged but never crash the server.
 */

import mongoose from 'mongoose';

const URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DB  = process.env.MONGODB_DB  || 'LAS_TAAPS';

// ─── seed data ───────────────────────────────────────────────────────────────

const TABLES = [
  { tableNumber: 'T1', seats: 2, status: 'available', occupiedBy: [] },
  { tableNumber: 'T2', seats: 2, status: 'available', occupiedBy: [] },
  { tableNumber: 'T3', seats: 4, status: 'available', occupiedBy: [] },
  { tableNumber: 'T4', seats: 4, status: 'available', occupiedBy: [] },
  { tableNumber: 'T5', seats: 4, status: 'available', occupiedBy: [] },
  { tableNumber: 'T6', seats: 6, status: 'available', occupiedBy: [] },
  { tableNumber: 'T7', seats: 6, status: 'available', occupiedBy: [] },
  { tableNumber: 'T8', seats: 8, status: 'available', occupiedBy: [] },
];

const MENU = [
  // food
  { foodId: 'F001', category: 'food',    name: 'Patatas Bravas',          description: 'Knapprige aardappelblokjes met pikante bravas-saus en aioli.',                   price: 5.50,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['aardappelen','tomatensaus','paprika','knoflook','olijfolie'], createdAt: new Date() },
  { foodId: 'F002', category: 'food',    name: 'Croquetas de Jamón',       description: 'Huisgemaakte kroketten gevuld met Iberische ham en béchamelsaus.',               price: 6.50,  vegetarian: false, halal: false, alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['Iberische ham','melk','bloem','boter','nootmuskaat','paneermeel'], createdAt: new Date() },
  { foodId: 'F003', category: 'food',    name: 'Gambas al Ajillo',         description: 'Garnalen gebakken in olijfolie met knoflook en rode peper.',                    price: 9.50,  vegetarian: false, halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['garnalen','knoflook','olijfolie','rode peper','peterselie'], createdAt: new Date() },
  { foodId: 'F004', category: 'food',    name: 'Pan con Tomate',           description: 'Geroosterd brood ingewreven met rijpe tomaat, knoflook en olijfolie.',           price: 4.00,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Catalonië',   ingredients: ['boerenbrood','tomaat','knoflook','olijfolie','zeezout'], createdAt: new Date() },
  { foodId: 'F005', category: 'food',    name: 'Pimientos de Padrón',      description: 'Gebakken groene paprika\'s uit Galicië, bestrooid met grof zeezout.',           price: 5.50,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Galicië',     ingredients: ['pimientos de Padrón','olijfolie','zeezout'], createdAt: new Date() },
  { foodId: 'F006', category: 'food',    name: 'Tortilla Española',        description: 'Klassieke Spaanse aardappelomelet, geserveerd op kamertemperatuur.',            price: 6.00,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['ei','aardappelen','ui','olijfolie','zout'], createdAt: new Date() },
  { foodId: 'F007', category: 'food',    name: 'Albóndigas en Salsa',      description: 'Gehaktballetjes gestoord in een rijke tomatensaus.',                            price: 7.50,  vegetarian: false, halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['rundergehakt','tomaat','ui','knoflook','kruiden'], createdAt: new Date() },
  { foodId: 'F008', category: 'food',    name: 'Pulpo a la Gallega',       description: 'Zachte octopus met aardappel, paprikapoeder en olijfolie.',                    price: 13.50, vegetarian: false, halal: true,  alcoholic: false, countryOfOrigin: 'Galicië',     ingredients: ['octopus','aardappelen','paprikapoeder','olijfolie','zeezout'], createdAt: new Date() },
  { foodId: 'F009', category: 'food',    name: 'Jamón Ibérico (50 g)',     description: 'Dun gesneden Iberische ham, 36 maanden gerijpt.',                               price: 14.00, vegetarian: false, halal: false, alcoholic: false, countryOfOrigin: 'Extremadura',  ingredients: ['Iberische ham'], createdAt: new Date() },
  { foodId: 'F010', category: 'food',    name: 'Calamares a la Romana',    description: 'Gefrituurde inktvisringen met een knapperig beslag en citroenaioli.',           price: 8.50,  vegetarian: false, halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['inktvis','bloem','ei','citroen','aioli'], createdAt: new Date() },
  { foodId: 'F011', category: 'food',    name: 'Boquerones en Vinagre',    description: 'Verse ansjovis gemarineerd in witte wijnazijn met knoflook.',                  price: 7.00,  vegetarian: false, halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['verse ansjovis','witte wijnazijn','knoflook','peterselie','olijfolie'], createdAt: new Date() },
  { foodId: 'F012', category: 'food',    name: 'Queso Manchego con Membrillo', description: 'Manchego kaas (12 maanden) geserveerd met kweepeergelei.',              price: 8.00,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'La Mancha',   ingredients: ['manchego','kweepeergelei'], createdAt: new Date() },
  // drinks
  { foodId: 'D001', category: 'drink',   name: 'Sangría (glas)',           description: 'Huisgemaakte rode sangría met seizoensfruit.',                                  price: 7.00,  vegetarian: true,  halal: false, alcoholic: true,  countryOfOrigin: 'Spanje',      ingredients: ['rode wijn','sinaasappelsap','appel','limoensap','brandy','suiker'], createdAt: new Date() },
  { foodId: 'D002', category: 'drink',   name: 'Cerveza Estrella Damm',    description: 'Spaans bier uit Barcelona — fris en licht.',                                   price: 4.00,  vegetarian: true,  halal: false, alcoholic: true,  countryOfOrigin: 'Catalonië',   ingredients: ['water','gerst','mout','hop'], createdAt: new Date() },
  { foodId: 'D003', category: 'drink',   name: 'Vino Tinto (glas)',        description: 'Selectie Spaanse rode wijn van de dag.',                                       price: 5.50,  vegetarian: true,  halal: false, alcoholic: true,  countryOfOrigin: 'Spanje',      ingredients: ['rode wijn'], createdAt: new Date() },
  { foodId: 'D004', category: 'drink',   name: 'Vino Blanco (glas)',       description: 'Frisse witte wijn — Albariño of Verdejo.',                                     price: 5.50,  vegetarian: true,  halal: false, alcoholic: true,  countryOfOrigin: 'Spanje',      ingredients: ['witte wijn'], createdAt: new Date() },
  { foodId: 'D005', category: 'drink',   name: 'Agua Mineral (0,5 L)',     description: 'Stille of bruisende mineraalwater.',                                           price: 2.50,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['water'], createdAt: new Date() },
  { foodId: 'D006', category: 'drink',   name: 'Cortado',                  description: 'Espresso met een scheutje gestoomde melk.',                                    price: 2.50,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['espresso','melk'], createdAt: new Date() },
  { foodId: 'D007', category: 'drink',   name: 'Tinto de Verano',          description: 'Rode wijn gemengd met limoen-frisdrank — de zomerse sangría.',                 price: 5.00,  vegetarian: true,  halal: false, alcoholic: true,  countryOfOrigin: 'Spanje',      ingredients: ['rode wijn','limoen-fanta'], createdAt: new Date() },
  { foodId: 'D008', category: 'drink',   name: 'Mojito',                   description: 'Cubaanse klassieker met rum, munt, limoen en bruiswater.',                     price: 8.00,  vegetarian: true,  halal: false, alcoholic: true,  countryOfOrigin: 'Cuba',        ingredients: ['witte rum','munt','limoen','suikersiroop','bruiswater'], createdAt: new Date() },
  { foodId: 'D009', category: 'drink',   name: 'Rioja Crianza (fles)',     description: 'Volle Rioja Crianza, 14 maanden gerijpt op eiken.',                            price: 26.00, vegetarian: true,  halal: false, alcoholic: true,  countryOfOrigin: 'Rioja',       ingredients: ['Tempranillo','Garnacha'], createdAt: new Date() },
  { foodId: 'D010', category: 'drink',   name: 'Frisdrank',                description: 'Cola, Fanta Sinaas, Fanta Citroen of Sprite.',                                 price: 2.50,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Nederland',   ingredients: ['bruiswater','suiker','aroma'], createdAt: new Date() },
  // desserts
  { foodId: 'DS001', category: 'dessert', name: 'Churros con Chocolate',   description: 'Knapperige churros met warme pure chocoladesaus.',                             price: 6.00,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['bloem','water','ei','zout','pure chocolade'], createdAt: new Date() },
  { foodId: 'DS002', category: 'dessert', name: 'Crema Catalana',          description: 'Romige custard met een gekaramelliseerde suikerkorst.',                        price: 5.50,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Catalonië',   ingredients: ['room','eidooier','suiker','kaneel','citroenschil'], createdAt: new Date() },
  { foodId: 'DS003', category: 'dessert', name: 'Flan de Huevo',           description: 'Klassieke Spaanse karamelkustard, zacht en luchtig.',                         price: 5.00,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Spanje',      ingredients: ['ei','volle melk','suiker','vanille'], createdAt: new Date() },
  { foodId: 'DS004', category: 'dessert', name: 'Tarta de Santiago',       description: 'Amandeltaart uit Galicië, bestrooid met poedersuiker.',                        price: 6.00,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Galicië',     ingredients: ['amandelen','ei','suiker','citroenschil','kaneel'], createdAt: new Date() },
  { foodId: 'DS005', category: 'dessert', name: 'Helado de Turrón',        description: 'Romig turrón-ijs gemaakt van traditionele Spaanse nougat.',                   price: 5.50,  vegetarian: true,  halal: true,  alcoholic: false, countryOfOrigin: 'Alicante',    ingredients: ['room','turrón','suiker','eidooier'], createdAt: new Date() },
];

const EMPLOYEES = [
  { employeeId: 'E001', name: 'Carlos Mendez', email: 'carlos@lastapas.nl', role: 'waiter', isActive: true, shiftDetails: 'Ma–Vr 17:00–23:00', createdAt: new Date('2024-01-10') },
  { employeeId: 'E002', name: 'Ana García',    email: 'ana@lastapas.nl',    role: 'waiter', isActive: true, shiftDetails: 'Di–Za 16:00–22:00', createdAt: new Date('2024-02-14') },
  { employeeId: 'E003', name: 'Jordi López',   email: 'jordi@lastapas.nl',  role: 'chef',   isActive: true, shiftDetails: 'Ma–Vr 15:00–23:00', createdAt: new Date('2023-11-01') },
  { employeeId: 'E004', name: 'Miguel Torres', email: 'miguel@lastapas.nl', role: 'bar',    isActive: true, shiftDetails: 'Do–Za 18:00–02:00', createdAt: new Date('2024-03-05') },
  { employeeId: 'E005', name: 'Sofia Ruiz',    email: 'sofia@lastapas.nl',  role: 'admin',  isActive: true, shiftDetails: 'Ma–Vr 09:00–17:00', createdAt: new Date('2023-09-01') },
];

// ─── main ────────────────────────────────────────────────────────────────────

export async function ensureDatabaseSeeded(): Promise<void> {
  // Use a dedicated connection so we don't interfere with the app's
  // cached Mongoose connection or trigger it before the first request.
  const conn = mongoose.createConnection(URI, {
    dbName: DB,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await conn.asPromise();
    const db = conn.db!;

    const tableCount = await db.collection('tables').countDocuments();
    if (tableCount > 0) {
      console.log(`[Startup] Database ready — ${tableCount} tables found, skipping seed.`);
      return;
    }

    console.log('[Startup] Empty database detected — seeding initial data…');

    await db.collection('tables').insertMany(TABLES);
    await db.collection('menu').insertMany(MENU);
    await db.collection('employees').insertMany(EMPLOYEES);

    // PaymentConfig singleton — only insert if missing
    const cfg = await db.collection('paymentconfig').findOne({ configId: 'singleton' });
    if (!cfg) {
      await db.collection('paymentconfig').insertOne({
        configId: 'singleton',
        tikkieApiKey: '',
        tikkieAppToken: '',
        iban: '',
        accountHolder: 'Las Tapas Restaurant',
        enabledMethods: ['pin', 'cash', 'tikkie'],
        updatedAt: new Date(),
        updatedBy: 'auto-seed',
      });
    }

    console.log(
      `[Startup] Seed complete — ${TABLES.length} tables, ${MENU.length} menu items, ${EMPLOYEES.length} employees.`
    );
  } catch (err) {
    // Never crash the server over a seed failure — MongoDB might still be
    // warming up on first boot. The app will handle missing data gracefully.
    console.error('[Startup] Seed failed (non-fatal):', (err as Error).message);
  } finally {
    await conn.close();
  }
}
