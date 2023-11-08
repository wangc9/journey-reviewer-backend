import mongoose, { Document, Model } from 'mongoose';

export interface IUser {
  username: String;
  stations?: [String];
  journeys?: [String];
  uid: String;
}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {}

const userSchema = new mongoose.Schema({
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
    delete returnedObject.__v;
  },
});

const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;
