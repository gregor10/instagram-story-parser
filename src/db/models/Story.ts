import mongoose from 'mongoose';

export interface IStory extends mongoose.Document {
  igId: string;
  igUserPk: number;
  igUsername: string;
  igMediaType: number;
  igUrl: string;
  takenAt: number;
  url: string;
}

const storySchema = new mongoose.Schema({
  igId: { type: String, required: true },
  igUserPk: { type: Number, required: true },
  igUsername: { type: String, required: true },
  igMediaType: { type: Number, required: true },
  igUrl: { type: String, required: true },
  takenAt: { type: Number, required: true },
  url: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IStory>('Story', storySchema);
