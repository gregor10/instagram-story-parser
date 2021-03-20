import crypto from 'crypto';
import { IHash } from 'db/models/Stalker';

const algorithm = process.env.CRT_ALGORITHM;
const secretKey = process.env.CRT_SECRET_KEY;
const iv = crypto.randomBytes(16);

export const encrypt = (text: string) => {
  if (!algorithm || !secretKey) {
    throw new Error('No algorithm or secretKey');
  }

  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  };
};

export const decrypt = (hash: IHash) => {
  if (!algorithm || !secretKey) {
    throw new Error('No algorithm or secretKey');
  }

  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

  return decrpyted.toString();
};
