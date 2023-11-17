import express, { Request, Response } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'express-async-errors';
import { auth } from 'firebase-admin';
import firebaseAdmin from '../utils/firebase_admin_config';
import User from '../models/user';
import Journey from '../models/journey';
import { checkDuration, updateStation } from '../services/journey-service';

const journeysRouter = express.Router();

/**
 * returns all journeys from database
 */
journeysRouter.get('/', async (_request: Request, response: Response) => {
  const journeys = await Journey.find({});
  response.json({ journeys });
});

/**
 * returns journey by id from database
 */
journeysRouter.get('/:id', async (request: Request, response: Response) => {
  // eslint-disable-next-line prefer-destructuring
  const id = request.params.id;
  const journeys = await Journey.findById(id);
  response.json({ journeys });
});

/**
 * receive token from firebase, decode and create new journey, return new journey, updated stations and user
 * request: { journeyBody, token }
 * response: { journey, updatedUser, newDepart, newDestin }
 */
journeysRouter.post('/', async (request: Request, response: Response) => {
  const { token, ...body } = request.body;
  if (token === undefined) {
    return response.status(401).json({
      error:
        'Only logged-in users can add journeys, please log in or sign up first',
    });
  }
  const decodedToken = await auth(firebaseAdmin).verifyIdToken(token);
  if (!decodedToken) {
    return response.status(401).json({
      error: 'Invalid user',
    });
  }
  const { uid } = decodedToken;
  const user = await User.findOne({ uid });
  if (user === null) {
    return response.status(401).json({
      error: 'User not found',
    });
  }
  const duration = checkDuration({
    startTime: body.startTime,
    endTime: body.endTime,
    duration: body.duration,
  });
  if (duration === undefined) {
    return response.status(400).json({
      error: 'Time data does not match duration',
    });
  }
  body.duration = duration;
  const newJourney = new Journey({
    ...body,
    // eslint-disable-next-line no-underscore-dangle
    user: user._id,
  });
  const journey = await newJourney.save();
  // eslint-disable-next-line no-underscore-dangle
  user.journeys = user.journeys.concat(journey._id);
  const updatedUser = await user.save();
  const { newDepart, newDestin, error } = await updateStation(
    body.departure,
    body.returnID,
    // eslint-disable-next-line no-underscore-dangle
    journey._id,
    user.username,
  );

  if (error) {
    return response.status(401).json({
      error,
    });
  }
  return response
    .status(201)
    .json({ journey, updatedUser, newDepart, newDestin });
});

/**
 * receive token from firebase, decode and create new journey, return new journey
 * request: { journeyBody, token }
 * response: { newJourney }
 */
// TODO: Add logic for endTime update when changing duration
// TODO: Add logic for duration update when changing time
// TODO: Add logic for station update
// journeysRouter.put('/:id', async (request: Request, response: Response) => {
//   const { token, ...body } = request.body;
//   if (token === undefined) {
//     response.status(401).json({
//       error:
//         'Only logged-in users can add stations, please log in or sign up first',
//     });
//   } else {
//     const decodedToken = await auth(firebaseAdmin).verifyIdToken(token);
//     if (!decodedToken) {
//       response.status(401).json({
//         error: 'Invalid user',
//       });
//     } else {
//       const { uid } = decodedToken;
//       const user = await User.findOne({ uid });
//       if (user === null) {
//         response.status(401).json({
//           error: 'User not found',
//         });
//       } else {
//         const newStation = await Station.findByIdAndUpdate(
//           request.params.id,
//           { ...body },
//           { new: true },
//         );
//         response.status(201).json({ newStation });
//       }
//     }
//   }
// });

export default journeysRouter;
