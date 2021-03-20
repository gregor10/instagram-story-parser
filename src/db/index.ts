import mongoose from 'mongoose';
import signale from 'signale';

export default {
  connect: () => new Promise((resolve, reject) => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      return reject(new Error('No mongoUri'));
    }

    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
      .then(() => {
        signale.success('Connected to db');
        return resolve('Success');
      })
      .catch((err) => {
        signale.fatal('Error connecting to db', err);
        return reject(err);
      });
  }),
  disconnect: () => new Promise((resolve, reject) => {
    mongoose.connection.close().then(() => {
      resolve('Success');
    }).catch((err) => reject(err));
  })
};
