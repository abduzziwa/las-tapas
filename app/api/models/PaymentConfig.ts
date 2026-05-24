import mongoose, { Schema } from 'mongoose';

const paymentConfigSchema = new Schema({
  configId:          { type: String, default: 'singleton', unique: true },
  tikkieApiKey:      { type: String, default: '' },
  tikkieAppToken:    { type: String, default: '' },
  iban:              { type: String, default: '' },
  accountHolder:     { type: String, default: '' },
  enabledMethods:    { type: [String], default: ['pin', 'cash'] },
  updatedAt:         { type: Date, default: Date.now },
  updatedBy:         { type: String, default: '' },
});

export const PaymentConfig = mongoose.models.PaymentConfig ||
  mongoose.model('PaymentConfig', paymentConfigSchema, 'paymentconfig');
