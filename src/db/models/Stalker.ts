import mongoose from 'mongoose';

export interface IHash {
  iv: string,
  content: string,
}

export interface ICredentials {
  username: string;
  hash: IHash;
}

export interface IStalker extends mongoose.Document {
  email: string;
  fullName: string;
  credentials: ICredentials;
}

const stalkerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  fullName: { type: String, required: true },
  credentials: {
    username: { type: String, required: true },
    hash: {
      iv: String,
      content: String
    }
  }
});

export default mongoose.model<IStalker>('Stalker', stalkerSchema);
