import express, { Request, Response } from 'express';

import { auth } from 'firebase-admin';
import firebaseAdmin from '../utils/firebase_admin_config';
import Station from '../models/station';
import User from '../models/user';

const stationsRouter = express.Router();

/**
 * returns all stations from database
 */
stationsRouter.get('/', async (_request: Request, response: Response) => {
  const stations = await Station.find({});
  response.json({ stations });
});

/**
 * receive token from firebase, decode and create new station, return new station
 * request: { stationBody, token }
 * response: { updatedUser, station }
 */
stationsRouter.post('/', async (request: Request, response: Response) => {
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
          error: 'User not found',
        });
      } else {
        try {
          const newStation = new Station({
            ...body,
            // eslint-disable-next-line no-underscore-dangle
            user: user._id,
          });
          const station = await newStation.save();
          // @ts-ignore
          // eslint-disable-next-line no-underscore-dangle
          user.stations = user.stations.concat(station._id);
          const updatedUser = await user.save();
          response.status(201).json({ updatedUser, station });
        } catch (error: unknown) {
          if (error instanceof Error) {
            response.status(401).json({ error: error.message });
          }
        }
      }
    }
  }
});

/**
 * receive token from firebase, decode and create new station, return new station
 * request: { stationBody, token }
 * response: { newStation }
 */
stationsRouter.put('/:id', async (request: Request, response: Response) => {
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
          error: 'User not found',
        });
      } else {
        const newStation = await Station.findByIdAndUpdate(
          request.params.id,
          { ...body },
          { new: true },
        );
        response.status(201).json({ newStation });
      }
    }
  }
});

export default stationsRouter;
