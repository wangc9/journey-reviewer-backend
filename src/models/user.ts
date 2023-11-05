import mongoose from 'mongoose';
import dotenv from 'dotenv';

interface IUser {
  username: String;
  stations?: [String];
  journeys?: [String];
}

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

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
  },
  stations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
    },
  ],
  journeys: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Journey',
    },
  ],
});

userSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    returnedObject.id = returnedObject._id.toString();
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject._id;
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject.__v;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
