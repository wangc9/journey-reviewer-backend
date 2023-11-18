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
 * returns station from database by SId
 */
stationsRouter.get(
  '/sid/:sid',
  async (request: Request, response: Response) => {
    const station = await Station.findOne({ SId: request.params.sid });
    response.json({ station });
  },
);

/**
 * receive token from firebase, decode and create new station, return new station
 * request: { stationBody, token }
 * response: { updatedUser, station }
 */
stationsRouter.post('/', async (request: Request, response: Response) => {
  const { body, user, authError } = await checkToken(request, 'add station');
  if (authError) {
    return response.status(401).json({ error: authError });
  }
  if (user === undefined) {
    return response.status(500).json({ error: 'Wrong logic in checkToken' });
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
    return response.status(500).json({
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
  const { body, user, authError } = await checkToken(request, 'update station');
  if (authError) {
    return response.status(401).json({ error: authError });
  }
  if (user === undefined) {
    return response.status(500).json({ error: 'Wrong logic in checkToken' });
  }
  const newStation = await Station.findByIdAndUpdate(
    request.params.id,
    { ...body },
    { new: true },
  );
  return response.status(201).json({ newStation });
});

stationsRouter.delete('/:id', async (request: Request, response: Response) => {
  const { user, authError } = await checkToken(request, 'update station');
  if (authError) {
    return response.status(401).json({ error: authError });
  }
  if (user === undefined) {
    return response.status(500).json({ error: 'Wrong logic in checkToken' });
  }
  const stationToDelete = await Station.findById(request.params.id);
  if (stationToDelete !== null) {
    const arriveJourneys = stationToDelete.journeys.get('arrive');
    const departJourneys = stationToDelete.journeys.get('depart');
    if (
      (arriveJourneys && arriveJourneys.length > 0) ||
      (departJourneys && departJourneys.length > 0)
    ) {
      return response.status(403).json({
        error:
          'Only station without affiliated journeys can be deleted. If you indeed want to delete this station, please delete all its attached journeys first',
      });
    }
    await Station.findByIdAndDelete(request.params.id);

    return response.status(204).end();
  }

  return response.status(400).json({ error: 'Can not find station' });
});

export default stationsRouter;
