import fs from 'fs';
import AWS from 'aws-sdk';
import signale from 'signale';
import https from 'https';
import path from 'path';

const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT || '');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
  params: {
    Bucket: process.env.BUCKET_NAME
  }
});

export const downloadImage = async (imageUrl: string) => {
  const [fileName] = path.basename(imageUrl).split('?');
  const dist = path.resolve(__dirname, '../uploads', fileName);
  const file = fs.createWriteStream(dist);

  return new Promise((resolve, reject) => {
    https.get(imageUrl, (response) => {
      const stream = response.pipe(file);

      stream.on('finish', () => {
        resolve(dist);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });
  });
};

export const uploadFile = (fromPath: string, directoryTo: string, imageName: string) => {
  const Bucket = process.env.BUCKET_NAME;
  if (!Bucket) {
    throw new Error('No bucket');
  }

  const bodyStream = fs.createReadStream(fromPath);
  const ext = path.extname(fromPath);

  const params: AWS.S3.PutObjectRequest = {
    Bucket,
    ACL: 'private',
    Key: `${directoryTo}/${imageName}${ext}`,
    Body: bodyStream
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      fs.unlink(fromPath, (error) => {
        if (error) {
          signale.fatal('Error occured in unlink', error);
        }
      });

      if (err) {
        return reject(err);
      }

      resolve(data.Location);
    });
  });
};
