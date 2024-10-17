import mongoose, { Schema, Document } from 'mongoose';

interface IShift extends Document {
    employeeId: string;
    shiftStart: Date;
    shiftEnd?: Date;
    totalBreakTime?: number;
    totalWorkTime?: number;
}

const ShiftSchema: Schema = new Schema({
    employeeId: { type: String, required: true },
    shiftStart: { type: Date, required: true },
    shiftEnd: { type: Date },
    totalBreakTime: { type: Number, default: 0 },
    totalWorkTime: { type: Number, default: 0 },
});

export default mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema);
