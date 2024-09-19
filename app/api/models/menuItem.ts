// import mongoose, { Schema, model } from 'mongoose';

// // export interface IMenuItem extends Document {
// //   foodId: string;
// //   name: string;
// //   description: string;
// //   price: number;
// //   category: 'food' | 'drink' | 'dessert';
// //   ingredients?: string[];
// //   halal?: boolean;
// //   vegetarian?: boolean;
// //   alcoholic?: boolean;
// //   countryOfOrigin: string;
// //   imageUrl: string;
// //   createdAt: Date;
// // }

// const menuItemsSchema: Schema = new Schema({
//   foodId: { type: String, required: true, unique: true },
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true },
//   category: { type: String, enum: ['food', 'drink', 'dessert'], required: true },
//   ingredients: { type: [String], required: false },
//   halal: { type: Boolean, required: false },
//   vegetarian: { type: Boolean, required: false },
//   alcoholic: { type: Boolean, required: false },
//   countryOfOrigin: { type: String, required: false },
//   imageUrl: { type: String, required: false },
//   createdAt: { type: Date, default: Date.now }
// });

// export const Menu = model('menu', menuItemsSchema);

import mongoose, { Schema, model } from 'mongoose';

const menuSchema = new Schema({
  foodId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['food', 'drink', 'dessert'], required: true },
  ingredients: { type: [String] }, // Optional for drinks and desserts
  halal: { type: Boolean },
  vegetarian: { type: Boolean },
  alcoholic: { type: Boolean }, // Only for drinks
  countryOfOrigin: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Menu = model('menu', menuSchema, 'menu');