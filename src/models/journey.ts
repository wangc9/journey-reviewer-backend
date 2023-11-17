import mongoose, { Document, Model } from 'mongoose';

export interface IJourney {
  startTime: string;
  endTime: string;
  departure: number;
  returnID: number;
  distance: number;
  duration?: number;
  user: mongoose.Types.ObjectId;
}

export interface IJourneyDocument extends IJourney, Document {}

export interface IJourneyModel extends Model<IJourneyDocument> {}

const journeySchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  departure: {
    type: Number,
    required: true,
  },
  returnID: {
    type: Number,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
    min: [
      10,
      'Invalid trip, please record a trip that covers more than 10 meters',
    ],
  },
  duration: {
    type: Number,
    min: [
      10,
      'Invalid trip, please record a trip that lasts for more than 10 seconds',
    ],
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

journeySchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    returnedObject.id = returnedObject._id.toString();
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject._id;
    // eslint-disable-next-line no-param-reassign,no-underscore-dangle
    delete returnedObject.__v;
  },
});

const Journey = mongoose.model<IJourneyModel>('Journey', journeySchema);

export default Journey;
