import mongoose, { Schema, Document } from 'mongoose';

interface IBreak extends Document {
    employeeId: string;
    shiftId: string;
    breakStart: Date;
    breakEnd?: Date;
}

const BreakSchema: Schema = new Schema({
    employeeId: { type: String, required: true },
    shiftId: { type: String, required: true },
    breakStart: { type: Date, required: true },
    breakEnd: { type: Date },
});

export default mongoose.models.Break || mongoose.model<IBreak>('Break', BreakSchema);
