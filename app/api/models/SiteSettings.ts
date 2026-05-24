import mongoose, { Schema } from 'mongoose';

const siteSettingsSchema = new Schema({
  // There is always exactly one document — use a fixed key
  _key:           { type: String, default: 'main', unique: true },
  heroImageUrl:   { type: String, default: '' },
  logoText:       { type: String, default: 'Las Tapas' },
  tagline:        { type: String, default: 'Authentic Spanish Tapas' },
  welcomeTitle:   { type: String, default: 'Welcome to Las Tapas' },
  welcomeText:    { type: String, default: 'Experience the finest tapas in an intimate, vibrant atmosphere. From classic patatas bravas to exquisite Iberian charcuterie, every dish is crafted with passion and the freshest ingredients.' },
  highlights:     { type: [String], default: ['Authentic Spanish cuisine', 'Award-winning wine selection', 'Warm, intimate atmosphere'] },
  qrInstructions: { type: String, default: 'Scan the QR code at your table with your phone camera to browse our menu and place your order.' },
  accentColor:    { type: String, default: '#F95E07' },
  address:        { type: String, default: '' },
  phone:          { type: String, default: '' },
  openingHours:   { type: String, default: '' },
  template:       { type: String, default: 'luxury-dark', enum: ['luxury-dark', 'warm-bistro', 'clean-modern'] },
  updatedAt:      { type: Date, default: Date.now },
});

export const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model('SiteSettings', siteSettingsSchema, 'sitesettings');
