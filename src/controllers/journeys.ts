/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
import express, { Request, Response } from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'express-async-errors';
import multer from 'multer';
import { parse } from 'papaparse';
import fs from 'fs';
import mongoose from 'mongoose';
import Journey, { IJourney } from '../models/journey';
import {
  IDuration,
  adjustTime,
  checkDuration,
  renewStation,
  updateStation,
} from '../services/journey-service';
import { checkToken } from '../services/util-service';
import { deleteJourney } from '../services/station-service';

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
  const { body, user, authError } = await checkToken(request, 'add journey');
  if (authError) {
    return response.status(401).json({ error: authError });
  }
  if (user === undefined) {
    return response.status(500).json({ error: 'Wrong logic in checkToken' });
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

export interface NJourney {
  departure: string;
  endTime: string;
  departureStationId: number | string;
  departureStationName: string;
  returnStationId: number | string;
  returnStationName: string;
  coveredDistance: number;
  duration: number;
}

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (_req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage });

const isNJourney = (journey: unknown): journey is NJourney =>
  journey instanceof Object &&
  !(journey instanceof Array) &&
  journey !== null &&
  'departure' in journey &&
  'endTime' in journey &&
  'departureStationId' in journey &&
  'departureStationName' in journey &&
  'returnStationId' in journey &&
  'returnStationName' in journey &&
  'coveredDistance' in journey &&
  'duration' in journey;

journeysRouter.post(
  '/file',
  upload.single('file'),
  async (request: Request, response: Response) => {
    const { user, authError } = await checkToken(request, 'add journey');
    if (authError) {
      return response.status(401).json({ error: authError });
    }
    if (user === undefined) {
      return response.status(500).json({ error: 'Wrong logic in checkToken' });
    }
    const { file } = request;
    const shortJourneys: Array<IJourney> = [];
    const addedJourneys: Array<mongoose.Types.ObjectId> = [];
    let errorMsg = '';
    let count = 0;
    const tempJourneys: Array<IJourney> = [];
    if (file) {
      const readStream = fs.createReadStream(file.path);
      parse(readStream, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        transformHeader(header, _) {
          const result = header
            .replace(/ *\([^)]*\) */g, '')
            .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (ltr, idx) =>
              idx === 0 ? ltr.toLowerCase() : ltr.toUpperCase(),
            )
            .replace(/\s+/g, '');
          if (result === 'return') {
            return 'endTime';
          }
          if (result === 'Departure') {
            return 'departure';
          }
          return result;
        },
        step: async (results, parser) => {
          parser.pause();
          if (isNJourney(results.data)) {
            try {
              count += 1;
              const {
                departure,
                endTime,
                departureStationId,
                returnStationId,
                duration,
                coveredDistance,
              } = results.data;
              const data = {
                startTime: departure,
                endTime,
                departure:
                  typeof departureStationId === 'string'
                    ? Number(departureStationId.split('_')[0])
                    : departureStationId,
                returnID:
                  typeof returnStationId === 'string'
                    ? Number(returnStationId.split('_')[0])
                    : returnStationId,
                distance: coveredDistance,
                duration,
              };
              const calculatedDuration = checkDuration({
                startTime: departure,
                endTime,
                duration,
              });
              if (calculatedDuration === undefined) {
                shortJourneys.push({
                  ...data,
                  // eslint-disable-next-line no-underscore-dangle
                  user: user._id,
                });
              } else {
                const found = await Journey.findOne(data);
                if (found) {
                  shortJourneys.push({
                    ...data,
                    // eslint-disable-next-line no-underscore-dangle
                    user: user._id,
                  });
                } else {
                  if (count < 2000) {
                    tempJourneys.push({
                      ...data,
                      // eslint-disable-next-line no-underscore-dangle
                      user: user._id,
                    });
                  } else {
                    const result = await Journey.insertMany(tempJourneys, {
                      ordered: false,
                    });
                    await Promise.all(
                      result.map(async (journey) => {
                        const { error } = await updateStation(
                          journey.departure,
                          journey.returnID,
                          // eslint-disable-next-line no-underscore-dangle
                          journey._id,
                          user.username,
                        );

                        if (error) {
                          errorMsg += `${error}\n`;
                        } else {
                          // eslint-disable-next-line no-underscore-dangle
                          addedJourneys.push(journey._id);
                        }
                      }),
                    );
                    // console.log('added 2000');
                    count = 0;
                    tempJourneys.length = 0;
                  }
                  // console.log(count);
                }
              }
            } catch (error) {
              errorMsg += `${error}\n`;
            }
          }
          parser.resume();
        },
        error: (error: unknown) => {
          if (error instanceof Error)
            return response
              .status(500)
              .json({ condition: 0, message: error.message });
          return response
            .status(500)
            .json({ condition: 0, message: 'unknown error during parsing' });
        },
        complete: async () => {
          try {
            if (count > 0) {
              const result = await Journey.insertMany(tempJourneys, {
                ordered: false,
              });
              await Promise.all(
                result.map(async (journey) => {
                  const { error } = await updateStation(
                    journey.departure,
                    journey.returnID,
                    // eslint-disable-next-line no-underscore-dangle
                    journey._id,
                    user.username,
                  );

                  if (error) {
                    errorMsg += `${error}\n`;
                  } else {
                    // eslint-disable-next-line no-underscore-dangle
                    addedJourneys.push(journey._id);
                  }
                }),
              );
              // console.log('Finished');
              count = 0;
              tempJourneys.length = 0;
            }
            user.journeys = user.journeys.concat(addedJourneys);
            await user.save();

            return response.status(201).json({
              condition: 1,
              message: `${addedJourneys.length} journeys added.\n ${
                errorMsg !== '' ? errorMsg : ''
              }`,
              disregarded: shortJourneys
                .map(
                  (journey) =>
                    `${journey.startTime}: ${journey.departure} -> ${journey.returnID}`,
                )
                .join(',\n'),
            });
          } catch (error) {
            if (error instanceof Error)
              return response
                .status(401)
                .json({ condition: 0, message: error.message });
            return response.status(500).json({
              condition: 0,
              message: 'unknown error when adding documents',
            });
          }
        },
      });
    } else {
      return response
        .status(500)
        .json({ condition: 0, message: 'No file detected' });
    }
  },
);

/**
 * receive token from firebase, decode and create new journey, return new journey
 * request: { journeyBody, token }
 * response: { newJourney, newDepart?, newDestin? }
 */
journeysRouter.put('/:id', async (request: Request, response: Response) => {
  const { body, user, authError } = await checkToken(request, 'update journey');
  if (authError) {
    return response.status(401).json({ error: authError });
  }
  if (user === undefined) {
    return response.status(500).json({ error: 'Wrong logic in checkToken' });
  }
  const originalJourney = await Journey.findById(request.params.id);
  if (originalJourney === null) {
    return response
      .status(400)
      .json({ error: 'No journey found, please check the journey id again' });
  }
  if (body.departure || body.returnID) {
    if (body.duration) {
      if (body.startTime && body.endTime) {
        const inputDuration: IDuration = {
          startTime: body.startTime,
          endTime: body.endTime,
          duration: body.duration,
        };
        const newDuration = checkDuration(inputDuration);
        if (newDuration === undefined) {
          return response.status(400).json({
            error: 'Time data does not match duration',
          });
        }
        const newJourney = await Journey.findByIdAndUpdate(
          request.params.id,
          { ...body, duration: newDuration },
          { new: true },
        );
        const { newDepart, newDestin, error } = await renewStation(
          originalJourney.departure,
          body.departure ? body.departure : originalJourney.departure,
          originalJourney.returnID,
          body.returnID ? body.returnID : originalJourney.returnID,
          // eslint-disable-next-line no-underscore-dangle
          originalJourney._id,
          user.username,
        );

        if (error) {
          return response.status(401).json({
            error,
          });
        }

        return response.status(200).json({ newJourney, newDepart, newDestin });
      }
      if (body.startTime) {
        const newTime = adjustTime(body.startTime, body.duration, 'start');
        const newJourney = await Journey.findByIdAndUpdate(
          request.params.id,
          { ...body, ...newTime },
          { new: true },
        );
        const { newDepart, newDestin, error } = await renewStation(
          originalJourney.departure,
          body.departure ? body.departure : originalJourney.departure,
          originalJourney.returnID,
          body.returnID ? body.returnID : originalJourney.returnID,
          // eslint-disable-next-line no-underscore-dangle
          originalJourney._id,
          user.username,
        );

        if (error) {
          return response.status(401).json({
            error,
          });
        }

        return response.status(200).json({ newJourney, newDepart, newDestin });
      }
      if (body.endTime) {
        const newTime = adjustTime(body.endTime, body.duration, 'end');
        const newJourney = await Journey.findByIdAndUpdate(
          request.params.id,
          { ...body, ...newTime },
          { new: true },
        );
        const { newDepart, newDestin, error } = await renewStation(
          originalJourney.departure,
          body.departure ? body.departure : originalJourney.departure,
          originalJourney.returnID,
          body.returnID ? body.returnID : originalJourney.returnID,
          // eslint-disable-next-line no-underscore-dangle
          originalJourney._id,
          user.username,
        );

        if (error) {
          return response.status(401).json({
            error,
          });
        }

        return response.status(200).json({ newJourney, newDepart, newDestin });
      }

      return response.status(401).json({
        error:
          'Can not only update duration, please also change at least one of the following: start time, end time',
      });
    }
    if (body.startTime && body.endTime) {
      const newDuration = checkDuration({
        startTime: body.startTime,
        endTime: body.endTime,
      });
      if (newDuration === undefined) {
        return response.status(400).json({
          error: 'Time data does not match duration',
        });
      }
      const newJourney = await Journey.findByIdAndUpdate(
        request.params.id,
        { ...body, duration: newDuration },
        { new: true },
      );

      const { newDepart, newDestin, error } = await renewStation(
        originalJourney.departure,
        body.departure ? body.departure : originalJourney.departure,
        originalJourney.returnID,
        body.returnID ? body.returnID : originalJourney.returnID,
        // eslint-disable-next-line no-underscore-dangle
        originalJourney._id,
        user.username,
      );

      if (error) {
        return response.status(401).json({
          error,
        });
      }

      return response.status(200).json({ newJourney, newDepart, newDestin });
    }
    if (body.startTime) {
      const newTime = adjustTime(
        body.startTime,
        originalJourney.duration,
        'start',
      );
      const newJourney = await Journey.findByIdAndUpdate(
        request.params.id,
        { ...body, ...newTime },
        { new: true },
      );

      const { newDepart, newDestin, error } = await renewStation(
        originalJourney.departure,
        body.departure ? body.departure : originalJourney.departure,
        originalJourney.returnID,
        body.returnID ? body.returnID : originalJourney.returnID,
        // eslint-disable-next-line no-underscore-dangle
        originalJourney._id,
        user.username,
      );

      if (error) {
        return response.status(401).json({
          error,
        });
      }

      return response.status(200).json({ newJourney, newDepart, newDestin });
    }
    if (body.endTime) {
      const newTime = adjustTime(body.endTime, originalJourney.duration, 'end');
      const newJourney = await Journey.findByIdAndUpdate(
        request.params.id,
        { ...body, ...newTime },
        { new: true },
      );

      const { newDepart, newDestin, error } = await renewStation(
        originalJourney.departure,
        body.departure ? body.departure : originalJourney.departure,
        originalJourney.returnID,
        body.returnID ? body.returnID : originalJourney.returnID,
        // eslint-disable-next-line no-underscore-dangle
        originalJourney._id,
        user.username,
      );

      if (error) {
        return response.status(401).json({
          error,
        });
      }

      return response.status(200).json({ newJourney, newDepart, newDestin });
    }
    const newJourney = await Journey.findByIdAndUpdate(
      request.params.id,
      { ...body },
      { new: true },
    );

    const { newDepart, newDestin, error } = await renewStation(
      originalJourney.departure,
      body.departure ? body.departure : originalJourney.departure,
      originalJourney.returnID,
      body.returnID ? body.returnID : originalJourney.returnID,
      // eslint-disable-next-line no-underscore-dangle
      originalJourney._id,
      user.username,
    );

    if (error) {
      return response.status(401).json({
        error,
      });
    }

    return response.status(200).json({ newJourney, newDepart, newDestin });
  }
  if (body.duration) {
    if (body.startTime && body.endTime) {
      const inputDuration: IDuration = {
        startTime: body.startTime,
        endTime: body.endTime,
        duration: body.duration,
      };
      const newDuration = checkDuration(inputDuration);
      if (newDuration === undefined) {
        return response.status(400).json({
          error: 'Time data does not match duration',
        });
      }
      const newJourney = await Journey.findByIdAndUpdate(
        request.params.id,
        { ...body, duration: newDuration },
        { new: true },
      );

      return response.status(200).json({ newJourney });
    }
    if (body.startTime) {
      const newTime = adjustTime(body.startTime, body.duration, 'start');
      const newJourney = await Journey.findByIdAndUpdate(
        request.params.id,
        { ...body, ...newTime },
        { new: true },
      );

      return response.status(200).json({ newJourney });
    }
    if (body.endTime) {
      const newTime = adjustTime(body.endTime, body.duration, 'end');
      const newJourney = await Journey.findByIdAndUpdate(
        request.params.id,
        { ...body, ...newTime },
        { new: true },
      );

      return response.status(200).json({ newJourney });
    }

    return response.status(401).json({
      error:
        'Can not only update duration, please also change at least one of the following: start time, end time',
    });
  }
  if (body.startTime && body.endTime) {
    const newDuration = checkDuration({
      startTime: body.startTime,
      endTime: body.endTime,
    });
    if (newDuration === undefined) {
      return response.status(400).json({
        error: 'Time data does not match duration',
      });
    }
    const newJourney = await Journey.findByIdAndUpdate(
      request.params.id,
      { ...body, duration: newDuration },
      { new: true },
    );

    return response.status(200).json({ newJourney });
  }
  if (body.startTime) {
    const newTime = adjustTime(
      body.startTime,
      originalJourney.duration,
      'start',
    );
    const newJourney = await Journey.findByIdAndUpdate(
      request.params.id,
      { ...body, ...newTime },
      { new: true },
    );

    return response.status(200).json({ newJourney });
  }
  if (body.endTime) {
    const newTime = adjustTime(body.endTime, originalJourney.duration, 'end');
    const newJourney = await Journey.findByIdAndUpdate(
      request.params.id,
      { ...body, ...newTime },
      { new: true },
    );

    return response.status(200).json({ newJourney });
  }
  const newJourney = await Journey.findByIdAndUpdate(
    request.params.id,
    { ...body },
    { new: true },
  );

  return response.status(200).json({ newJourney });
});

journeysRouter.delete('/:id', async (request: Request, response: Response) => {
  const { user, authError } = await checkToken(request, 'delete journey');
  if (authError) {
    return response.status(401).json({ error: authError });
  }
  if (user === undefined) {
    return response.status(500).json({ error: 'Wrong logic in checkToken' });
  }
  const journey = await Journey.findById(request.params.id);
  if (journey) {
    // eslint-disable-next-line no-underscore-dangle
    if (journey.user.toString() !== user._id.toString()) {
      return response.status(403).json({
        error:
          'You do not have clearance. Only the author of the journey can delete it',
      });
    }
    const { updatedDepartStation, updatedDestStation, error } =
      await deleteJourney({
        departure: journey.departure,
        returnID: journey.returnID,
        journeyID: request.params.id,
      });
    if (error) {
      return response.status(500).json({ error });
    }
    await Journey.findByIdAndDelete(request.params.id);

    return response
      .status(204)
      .json({ updatedDepartStation, updatedDestStation });
  }
  return response.status(500).json({ error: 'Can not find journey' });
});

export default journeysRouter;
