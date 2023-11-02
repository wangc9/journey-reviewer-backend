import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
mongoose.set('strictQuery', false);

const mongoURL = process.env.MONGODB_URL;

export async function run(url: string|undefined) {
  if (typeof url === 'string') {
    await mongoose.connect(url);
    console.log('Mongoose connected');
  } else {
    throw new Error('MongoDB url is not provided');
  }
  mongoose.connection.close();
}

run(mongoURL).catch(err => console.log(err));
