import express from 'express';

import { auth } from 'firebase-admin';
import firebaseAdmin from '../config/firebase_admin_config';
import Station from '../models/station';
import User from '../models/user';

const stationsRouter = express.Router();

stationsRouter.get('/', async (_request, response) => {
  const stations = await Station.find({});
  response.json({ stations });
});

stationsRouter.post('/', async (request, response) => {
  const { token, ...body } = request.body;
  if (token === undefined) {
    response.status(401).json({
      error:
        'Only logged-in users can add stations, please log in or sign up first',
    });
  } else {
    const decodedToken = await auth(firebaseAdmin).verifyIdToken(token);
    if (!decodedToken) {
      response.status(401).json({
        error: 'Invalid user',
      });
    } else {
      const { uid } = decodedToken;
      const user = await User.findOne({ uid });
      if (user === null) {
        response.status(401).json({
          error: 'Invalid user',
        });
      } else {
        const newStation = new Station({
          ...body,
          // eslint-disable-next-line no-underscore-dangle
          user: user._id,
        });
        const station = await newStation.save();
        response.status(201).json({ station });
      }
    }
  }
});

export default stationsRouter;
