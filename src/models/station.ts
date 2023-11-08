import mongoose, { Document, Model } from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import mongooseUniqueValidator from 'mongoose-unique-validator';

interface IStation {
  SId: Number;
  Nimi: String;
  Namn: String;
  Name: String;
  Osoite: String;
  Adress: String;
  Kaupunki: 'Helsinki' | 'Espoo';
  Stad: 'Helsingfors' | 'Esbo';
  Capacity: Number;
  x: Number;
  y: Number;
  journeys: Array<mongoose.Schema.Types.ObjectId>;
  user: mongoose.Schema.Types.ObjectId;
}

export interface IStationDocument extends IStation, Document {}

export interface IStationModel extends Model<IStationDocument> {}

const stationSchema = new mongoose.Schema({
  SId: {
    type: Number,
    unique: true,
    required: true,
  },
  Nimi: {
    type: String,
    required: true,
  },
  Namn: {
    type: String,
    required: true,
  },
  Name: {
    type: String,
    required: true,
  },
  Osoite: {
    type: String,
    required: true,
  },
  Adress: {
    type: String,
    required: true,
  },
  Kaupunki: {
    type: String,
    enum: ['Helsinki', 'Espoo'],
    default: 'Helsinki',
  },
  Stad: {
    type: String,
    enum: ['Helsingfors', 'Esbo'],
    default: 'Helsingfors',
  },
  Capacity: {
    type: Number,
    required: true,
  },
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  journeys: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Journey',
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

stationSchema.plugin(mongooseUniqueValidator);

stationSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    returnedObject.id = returnedObject._id.toString();
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject._id;
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject.__v;
  },
});

const Station = mongoose.model<IStationDocument>('Station', stationSchema);

export default Station;
