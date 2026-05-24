import mongoose, { Schema } from 'mongoose';

const dailyAssignmentSchema = new Schema({
  employeeId:   { type: String, required: true },
  date:         { type: String, required: true }, // YYYY-MM-DD
  assignedRole: { type: String, required: true, enum: ['waiter', 'bar', 'chef', 'manager'] },
  assignedBy:   { type: String, required: true },
  createdAt:    { type: Date, default: Date.now },
});

dailyAssignmentSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const DailyAssignment =
  mongoose.models.DailyAssignment ||
  mongoose.model('DailyAssignment', dailyAssignmentSchema, 'daily_assignments');
