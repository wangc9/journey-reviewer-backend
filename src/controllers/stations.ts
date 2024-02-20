/* eslint-disable @typescript-eslint/indent */
import express, { Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'papaparse';
import mongoose, { Error } from 'mongoose';
import fs from 'fs';
import { checkToken } from '../services/util-service';
import Station, { IStation } from '../models/station';

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

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface NStation {
  FID: number;
  ID: number;
  Nimi: string;
  Namn: string;
  Name: string;
  Osoite: string;
  Adress: string;
  Kaupunki: 'Helsinki' | 'Espoo';
  Stad: 'Helsingfors' | 'Esbo';
  Operaattor: string;
  Kapasiteet: number;
  x: number;
  y: number;
}

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (_req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

const isNStation = (station: unknown): station is NStation =>
  station instanceof Object &&
  !(station instanceof Array) &&
  station !== null &&
  'FID' in station &&
  'ID' in station &&
  'Nimi' in station &&
  'Namn' in station &&
  'Name' in station &&
  'Osoite' in station &&
  'Adress' in station &&
  'Kapasiteet' in station &&
  'x' in station &&
  'y' in station;

stationsRouter.post(
  '/file',
  upload.single('file'),
  async (request: Request, response: Response) => {
    const { user, authError } = await checkToken(request, 'add station');
    if (authError) {
      return response.status(401).json({ error: authError });
    }
    if (user === undefined) {
      return response.status(500).json({ error: 'Wrong logic in checkToken' });
    }
    const { file } = request;
    const stationBuffer: Array<
      Omit<IStation, 'journeys' | 'destination' | 'departure'>
    > = [];
    if (file) {
      parse(fs.readFileSync(file.path, 'utf8'), {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        step: (results) => {
          if (isNStation(results.data)) {
            const { FID, ID, Operaattor, Kapasiteet, ...rest1 } = results.data;
            stationBuffer.push({
              SId: ID,
              Capacity: Kapasiteet,
              // eslint-disable-next-line no-underscore-dangle
              user: user._id,
              ...rest1,
              Kaupunki:
                results.data.Kaupunki === 'Espoo' ? 'Espoo' : 'Helsinki',
              Stad: results.data.Stad === 'Esbo' ? 'Esbo' : 'Helsingfors',
            });
          }
        },
        error: (error: unknown) => {
          if (error instanceof Error)
            return response.status(500).json({ error: error.message });
          return response
            .status(500)
            .json({ error: 'unknown error during parsing' });
        },
      });
      try {
        const results = await Station.insertMany(stationBuffer, {
          ordered: false,
        });
        const addedStations: Array<mongoose.Types.ObjectId> = [];
        results.forEach((result) => {
          // eslint-disable-next-line no-underscore-dangle
          addedStations.push(result._id);
          const index = stationBuffer.findIndex(
            (station) => station.SId === result.SId,
          );
          if (index > -1) {
            stationBuffer.splice(index, 1);
          }
        });
        user.stations = user.stations.concat(addedStations);
        await user.save();

        return response.status(201).json({
          status: 1,
          message: `${addedStations.length} stations added`,
          disregarded: stationBuffer.map((station) => station.Nimi).join(',\n'),
        });
      } catch (error) {
        if (error instanceof Error)
          return response
            .status(401)
            .json({ status: 0, message: error.message });
        return response
          .status(500)
          .json({ status: 0, message: 'unknown error when adding documents' });
      }
    }
    return response
      .status(500)
      .json({ status: 0, message: 'No file detected' });
  },
);

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
