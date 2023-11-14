import express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRouter from './src/controllers/users';
import loginRouter from './src/controllers/login';
import stationsRouter from './src/controllers/stations';
import journeysRouter from './src/controllers/journeys';

const app = express();

dotenv.config();
mongoose.set('strictQuery', false);
const url = process.env.MONGODB_URL;
if (typeof url === 'string') {
  mongoose
    .connect(url)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then((_result) => {
      // eslint-disable-next-line no-console
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(`Error when connecting to MongoDB: ${error.message}`);
    });
} else {
  throw new Error('MongoDB url is not valid');
}

app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/login', loginRouter);
app.use('/api/stations', stationsRouter);
app.use('/api/journeys', journeysRouter);

export default app;
