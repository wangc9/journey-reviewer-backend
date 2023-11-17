import express, { Request, Response } from 'express';
import { checkToken } from '../services/util-service';
import Station from '../models/station';

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
  const { body, user, authError } = await checkToken(request);
  if (authError) {
    return response.status(401).json({ error: authError });
  }
  if (user === undefined) {
    return response.status(400).json({ error: 'Wrong logic in checkToken' });
  }

  const newStation = new Station({
    ...body,
    // eslint-disable-next-line no-underscore-dangle
    user: user._id,
  });
  try {
    const station = await newStation.save();
    // eslint-disable-next-line no-underscore-dangle
    user.stations = user.stations.concat(station._id);
    const updatedUser = await user.save();
    return response.status(201).json({ updatedUser, station });
  } catch (error) {
    if (error instanceof Error) {
      return response.status(401).json({ error: error.message });
    }
    return response
      .status(400)
      .json({
        error: 'A logic error occuered when posting through stationsRouter',
      });
  }
});

/**
 * receive token from firebase, decode and create new station, return new station
 * request: { stationBody, token }
 * response: { newStation }
 */
stationsRouter.put('/:id', async (request: Request, response: Response) => {
  const { body, user, authError } = await checkToken(request);
  if (authError) {
    return response.status(401).json({ error: authError });
  }
  if (user === undefined) {
    return response.status(400).json({ error: 'Wrong logic in checkToken' });
  }
  const newStation = await Station.findByIdAndUpdate(
    request.params.id,
    { ...body },
    { new: true },
  );
  return response.status(201).json({ newStation });
});

export default stationsRouter;
