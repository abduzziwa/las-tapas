import mongoose, { Schema, Document } from 'mongoose';

interface IEmployee extends Document {
  employeeId: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  isActive: boolean;
  shiftDetails: string;
}

const employeeSchema: Schema = new Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  shiftDetails: {
    type: String,
    required: true
  }
});

export const Employees = mongoose.models.Employees || mongoose.model<IEmployee>('Employees', employeeSchema, 'employees');
