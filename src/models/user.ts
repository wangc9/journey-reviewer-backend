import mongoose from 'mongoose';

interface IUser {
  username: String;
  stations?: [String];
  journeys?: [String];
  uid: String;
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
  uid: {
    type: String,
    required: true,
  },
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
