import mongoose from 'mongoose';

interface IStalkee extends mongoose.Document {
  igUsername: string;
  igPk?: number;
}

const stalkeeSchema = new mongoose.Schema({
  igUsername: { type: String, required: true },
  igPk: { type: Number, required: false }
});

export default mongoose.model<IStalkee>('Stalkee', stalkeeSchema);
