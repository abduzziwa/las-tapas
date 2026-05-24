/**
 * Las Tapas — Menu seed script
 *
 * Seeds (or refreshes) the full menu: food, drinks, desserts.
 * Safe to run multiple times — uses upsert on foodId.
 * Does NOT touch employees, orders, sessions, or tables.
 *
 * Local:  npm run seed:menu
 * Docker: docker compose exec app node scripts/seed-menu.mjs
 */

import mongoose from 'mongoose';
import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env / .env.local so the script works outside Docker too ────────────
const __dir = dirname(fileURLToPath(import.meta.url));
for (const file of ['.env.local', '.env']) {
  const p = join(__dir, '..', file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
  break; // first file found wins
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const DB_NAME     = process.env.MONGODB_DB  || 'LAS_TAAPS';

// ── Menu items ────────────────────────────────────────────────────────────────

const MENU = [

  // ── Food ──────────────────────────────────────────────────────────────────
  {
    foodId: 'F001', category: 'food', name: 'Patatas Bravas',
    description: 'Crispy potato cubes with spicy bravas sauce and aioli.',
    price: 5.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['potatoes', 'tomato sauce', 'paprika', 'garlic', 'olive oil'],
    images: [],
  },
  {
    foodId: 'F002', category: 'food', name: 'Croquetas de Jamón',
    description: 'Homemade croquettes filled with Iberian ham and béchamel.',
    price: 6.50, vegetarian: false, halal: false, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['Iberian ham', 'milk', 'flour', 'butter', 'nutmeg', 'breadcrumbs'],
    images: [],
  },
  {
    foodId: 'F003', category: 'food', name: 'Gambas al Ajillo',
    description: 'Prawns sautéed in olive oil with garlic and chilli.',
    price: 9.50, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['prawns', 'garlic', 'olive oil', 'red chilli', 'parsley'],
    images: [],
  },
  {
    foodId: 'F004', category: 'food', name: 'Pan con Tomate',
    description: 'Toasted bread rubbed with ripe tomato, garlic and olive oil.',
    price: 4.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Catalonia',
    ingredients: ['sourdough bread', 'tomato', 'garlic', 'olive oil', 'sea salt'],
    images: [],
  },
  {
    foodId: 'F005', category: 'food', name: 'Pimientos de Padrón',
    description: 'Fried Galician green peppers sprinkled with coarse sea salt.',
    price: 5.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Galicia',
    ingredients: ['pimientos de Padrón', 'olive oil', 'sea salt'],
    images: [],
  },
  {
    foodId: 'F006', category: 'food', name: 'Tortilla Española',
    description: 'Classic Spanish potato omelette, served at room temperature.',
    price: 6.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['egg', 'potatoes', 'onion', 'olive oil', 'salt'],
    images: [],
  },
  {
    foodId: 'F007', category: 'food', name: 'Albóndigas en Salsa',
    description: 'Meatballs braised in a rich tomato sauce.',
    price: 7.50, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['beef mince', 'tomato', 'onion', 'garlic', 'herbs'],
    images: [],
  },
  {
    foodId: 'F008', category: 'food', name: 'Pulpo a la Gallega',
    description: 'Tender octopus with potato, smoked paprika and olive oil.',
    price: 13.50, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Galicia',
    ingredients: ['octopus', 'potatoes', 'smoked paprika', 'olive oil', 'sea salt'],
    images: [],
  },
  {
    foodId: 'F009', category: 'food', name: 'Jamón Ibérico (50 g)',
    description: 'Thinly sliced Iberian ham, aged 36 months.',
    price: 14.00, vegetarian: false, halal: false, alcoholic: false,
    countryOfOrigin: 'Extremadura',
    ingredients: ['Iberian ham'],
    images: [],
  },
  {
    foodId: 'F010', category: 'food', name: 'Calamares a la Romana',
    description: 'Deep-fried squid rings in a light batter with lemon aioli.',
    price: 8.50, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['squid', 'flour', 'egg', 'lemon', 'aioli'],
    images: [],
  },
  {
    foodId: 'F011', category: 'food', name: 'Boquerones en Vinagre',
    description: 'Fresh anchovies marinated in white wine vinegar with garlic and parsley.',
    price: 7.00, vegetarian: false, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['fresh anchovies', 'white wine vinegar', 'garlic', 'parsley', 'olive oil'],
    images: [],
  },
  {
    foodId: 'F012', category: 'food', name: 'Queso Manchego con Membrillo',
    description: 'Manchego cheese (12 months) served with quince jelly.',
    price: 8.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'La Mancha',
    ingredients: ['manchego', 'quince jelly'],
    images: [],
  },

  // ── Drinks ────────────────────────────────────────────────────────────────
  {
    foodId: 'D001', category: 'drink', name: 'Sangría (glass)',
    description: 'House-made red sangría with seasonal fruit.',
    price: 7.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Spain',
    ingredients: ['red wine', 'orange juice', 'apple', 'lime juice', 'brandy', 'sugar'],
    images: [],
  },
  {
    foodId: 'D002', category: 'drink', name: 'Cerveza Estrella Damm',
    description: 'Spanish lager from Barcelona — crisp and light.',
    price: 4.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Catalonia',
    ingredients: ['water', 'barley', 'malt', 'hops'],
    images: [],
  },
  {
    foodId: 'D003', category: 'drink', name: 'Vino Tinto (glass)',
    description: 'Today\'s selection of Spanish red wine.',
    price: 5.50, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Spain',
    ingredients: ['red wine'],
    images: [],
  },
  {
    foodId: 'D004', category: 'drink', name: 'Vino Blanco (glass)',
    description: 'Fresh white wine — Albariño or Verdejo.',
    price: 5.50, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Spain',
    ingredients: ['white wine'],
    images: [],
  },
  {
    foodId: 'D005', category: 'drink', name: 'Agua Mineral (0.5 L)',
    description: 'Still or sparkling mineral water.',
    price: 2.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['water'],
    images: [],
  },
  {
    foodId: 'D006', category: 'drink', name: 'Cortado',
    description: 'Espresso with a dash of steamed milk.',
    price: 2.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['espresso', 'milk'],
    images: [],
  },
  {
    foodId: 'D007', category: 'drink', name: 'Tinto de Verano',
    description: 'Red wine mixed with lemon soda — the summer sangría.',
    price: 5.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Spain',
    ingredients: ['red wine', 'lemon soda'],
    images: [],
  },
  {
    foodId: 'D008', category: 'drink', name: 'Mojito',
    description: 'Cuban classic with rum, mint, lime and sparkling water.',
    price: 8.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Cuba',
    ingredients: ['white rum', 'mint', 'lime', 'sugar syrup', 'sparkling water'],
    images: [],
  },
  {
    foodId: 'D009', category: 'drink', name: 'Rioja Crianza (bottle)',
    description: 'Full-bodied Rioja Crianza, 14 months oak aged.',
    price: 26.00, vegetarian: true, halal: false, alcoholic: true,
    countryOfOrigin: 'Rioja',
    ingredients: ['Tempranillo', 'Garnacha'],
    images: [],
  },
  {
    foodId: 'D010', category: 'drink', name: 'Soft Drink',
    description: 'Cola, Orange Fanta, Lemon Fanta or Sprite.',
    price: 2.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Netherlands',
    ingredients: ['sparkling water', 'sugar', 'flavouring'],
    images: [],
  },

  // ── Desserts ──────────────────────────────────────────────────────────────
  {
    foodId: 'DS001', category: 'dessert', name: 'Churros con Chocolate',
    description: 'Crispy churros with warm dark chocolate dipping sauce.',
    price: 6.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['flour', 'water', 'egg', 'salt', 'dark chocolate'],
    images: [],
  },
  {
    foodId: 'DS002', category: 'dessert', name: 'Crema Catalana',
    description: 'Creamy custard with a caramelised sugar crust.',
    price: 5.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Catalonia',
    ingredients: ['cream', 'egg yolk', 'sugar', 'cinnamon', 'lemon zest'],
    images: [],
  },
  {
    foodId: 'DS003', category: 'dessert', name: 'Flan de Huevo',
    description: 'Classic Spanish caramel custard — soft and silky.',
    price: 5.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Spain',
    ingredients: ['egg', 'whole milk', 'sugar', 'vanilla'],
    images: [],
  },
  {
    foodId: 'DS004', category: 'dessert', name: 'Tarta de Santiago',
    description: 'Almond cake from Galicia, dusted with icing sugar.',
    price: 6.00, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Galicia',
    ingredients: ['almonds', 'egg', 'sugar', 'lemon zest', 'cinnamon'],
    images: [],
  },
  {
    foodId: 'DS005', category: 'dessert', name: 'Helado de Turrón',
    description: 'Creamy nougat ice cream made from traditional Spanish turrón.',
    price: 5.50, vegetarian: true, halal: true, alcoholic: false,
    countryOfOrigin: 'Alicante',
    ingredients: ['cream', 'turrón', 'sugar', 'egg yolk'],
    images: [],
  },
];

// ── Seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(`\n🌱  Connecting to ${MONGODB_URI}${DB_NAME} …`);
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  const col = mongoose.connection.db.collection('menu');

  let inserted = 0;
  let updated  = 0;

  for (const item of MENU) {
    const result = await col.updateOne(
      { foodId: item.foodId },
      { $set: item },
      { upsert: true }
    );
    if (result.upsertedCount) inserted++;
    else if (result.modifiedCount) updated++;
  }

  await mongoose.disconnect();

  const food     = MENU.filter(i => i.category === 'food').length;
  const drinks   = MENU.filter(i => i.category === 'drink').length;
  const desserts = MENU.filter(i => i.category === 'dessert').length;

  console.log(`\n✅  Menu seeded — ${MENU.length} items total`);
  console.log(`    ${food} food  ·  ${drinks} drinks  ·  ${desserts} desserts`);
  if (inserted) console.log(`    ${inserted} new items inserted`);
  if (updated)  console.log(`    ${updated} existing items updated`);
  console.log(`\n   Images can be uploaded later via the Admin → Menu panel.\n`);
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
