// eslint-disable-next-line import/no-extraneous-dependencies
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import firebaseClient from '../utils/firebase_client_config';
import app from '../../app';
import Journey, { IJourney } from '../models/journey';

const api = supertest(app);

const auth = getAuth(firebaseClient);

describe('Test journey without login', () => {
  test('Can not add journey without login', async () => {
    const testJourney: Omit<IJourney, 'user' | 'duration'> = {
      startTime: '2023-11-09T11:48:00',
      endTime: '2023-11-09T11:50:00',
      departure: 1700209396660,
      returnID: 1700209425434,
      distance: 25,
    };
    await api.post('/api/journeys').send(testJourney).expect(401);
  });
});

describe('Test journey database logic', () => {
  let time: string;
  let endTime: string;
  let wrongTime: string;
  let id: string;
  let token: string | undefined;

  beforeAll(async () => {
    const date = new Date();
    time = date.toISOString();
    date.setSeconds(date.getSeconds() + 20);
    endTime = date.toISOString();
    date.setSeconds(date.getSeconds() - 60);
    wrongTime = date.toISOString();
    await signInWithEmailAndPassword(
      auth,
      'test1699277335156@test.com',
      'qwerty123',
    );
    token = await auth.currentUser?.getIdToken(true);
  });

  test('End time can not be before start time', async () => {
    const testJourney: Omit<IJourney, 'user' | 'duration'> = {
      startTime: time,
      endTime: wrongTime,
      departure: 1700209396660,
      returnID: 1700209425434,
      distance: 25,
    };
    await api
      .post('/api/journeys')
      .send({ ...testJourney, token })
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  test('Add journey successful with correct credentials', async () => {
    const testJourney: Omit<IJourney, 'user' | 'duration'> = {
      startTime: time,
      endTime,
      departure: 1700213919875,
      returnID: 1700213342292,
      distance: 25,
    };
    const result = await api
      .post('/api/journeys')
      .send({ ...testJourney, token })
      .expect(201)
      .expect('Content-Type', /application\/json/);
    id = result.body.journey.id;
    expect(result.body.journey.startTime).toBe(time);
    expect(result.body.journey.duration).toBe(20);
    expect(result.body.updatedUser.journeys).toContain(result.body.journey.id);
  });

  describe('Time should be updated correctly', () => {
    test('Journey can not only update duration', async () => {
      const journey = await Journey.findById(id);
      if (journey) {
        const result = await api
          // eslint-disable-next-line no-underscore-dangle
          .put(`/api/journeys/${journey._id}`)
          .send({ duration: 50, token })
          .expect(401)
          .expect('Content-Type', /application\/json/);
        expect(result.body.error).toContain('Can not only update duration');
      }
    });

    test('Journey should change end time with start time update', async () => {
      const journey = await Journey.findById(id);
      if (journey) {
        const result = await api
          // eslint-disable-next-line no-underscore-dangle
          .put(`/api/journeys/${journey._id}`)
          .send({ startTime: endTime, token })
          .expect(200)
          .expect('Content-Type', /application\/json/);
        const tempResult = new Date(endTime);
        tempResult.setTime(tempResult.getTime() + 20000);
        expect(result.body.newJourney.endTime).toBe(tempResult.toISOString());
      }
    });

    test('Journey should change end time with start time and duration update', async () => {
      const journey = await Journey.findById(id);
      if (journey) {
        const tempInput = new Date(endTime);
        tempInput.setTime(tempInput.getTime() + 20000);
        const result = await api
          // eslint-disable-next-line no-underscore-dangle
          .put(`/api/journeys/${journey._id}`)
          .send({ startTime: tempInput.toISOString(), duration: 100, token })
          .expect(200)
          .expect('Content-Type', /application\/json/);
        const tempResult = new Date(endTime);
        tempResult.setTime(tempResult.getTime() + 120000);
        expect(result.body.newJourney.endTime).toBe(tempResult.toISOString());
      }
    });

    test('Journey should change start time with end time update', async () => {
      const journey = await Journey.findById(id);
      if (journey) {
        const tempInput = new Date(journey.endTime);
        tempInput.setTime(tempInput.getTime() - 20000);
        const result = await api
          // eslint-disable-next-line no-underscore-dangle
          .put(`/api/journeys/${journey._id}`)
          .send({ endTime: tempInput, token })
          .expect(200)
          .expect('Content-Type', /application\/json/);
        expect(result.body.newJourney.startTime).toBe(endTime);
      }
    });

    test('Journey should change start time with end time and duration update', async () => {
      const journey = await Journey.findById(id);
      if (journey) {
        const tempInput = new Date(endTime);
        tempInput.setTime(tempInput.getTime() + 20000);
        const result = await api
          // eslint-disable-next-line no-underscore-dangle
          .put(`/api/journeys/${journey._id}`)
          .send({ endTime: tempInput.toISOString(), duration: 40, token })
          .expect(200)
          .expect('Content-Type', /application\/json/);
        const tempResult = new Date(endTime);
        tempResult.setTime(tempResult.getTime() + 120000);
        expect(result.body.newJourney.startTime).toBe(time);
      }
    });

    test('Journey should change all time correctly', async () => {
      const journey = await Journey.findById(id);
      if (journey) {
        const result = await api
          // eslint-disable-next-line no-underscore-dangle
          .put(`/api/journeys/${journey._id}`)
          .send({ startTime: time, endTime, token })
          .expect(200)
          .expect('Content-Type', /application\/json/);
        expect(result.body.newJourney.startTime).toBe(time);
        expect(result.body.newJourney.endTime).toBe(endTime);
        expect(result.body.newJourney.duration).toEqual(20);
      }
    });
  });

  describe('station should be updated correctly', () => {
    describe('new departure station', () => {
      test('Journey should change end time with start time update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const destination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          const destinationID = destination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({ startTime: endTime, departure: 1700209359420, token })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 20000);
          expect(result.body.newJourney.endTime).toBe(tempResult.toISOString());
          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[destinationID]).toBe(
            initOldDepartStation.body.station.destination[destinationID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[destinationID]).toBe(
            initNewDeparture.body.station.destination[destinationID]
              ? initNewDeparture.body.station.destination[destinationID] + 1
              : 1,
          );
          const updatedDestination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            updatedDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDestination.body.station.departure[oldDepartID]).toBe(
            destination.body.station.departure[oldDepartID] - 1,
          );
          expect(updatedDestination.body.station.departure[newDepartID]).toBe(
            destination.body.station.departure[newDepartID]
              ? destination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });

      test('Journey should change end time with start time and duration update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const destination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          const destinationID = destination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const tempInput = new Date(endTime);
          tempInput.setTime(tempInput.getTime() + 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              startTime: tempInput.toISOString(),
              departure: 1700213059172,
              duration: 100,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 120000);
          expect(result.body.newJourney.endTime).toBe(tempResult.toISOString());
          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[destinationID]).toBe(
            initOldDepartStation.body.station.destination[destinationID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[destinationID]).toBe(
            initNewDeparture.body.station.destination[destinationID]
              ? initNewDeparture.body.station.destination[destinationID] + 1
              : 1,
          );
          const updatedDestination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            updatedDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDestination.body.station.departure[oldDepartID]).toBe(
            destination.body.station.departure[oldDepartID] - 1,
          );
          expect(updatedDestination.body.station.departure[newDepartID]).toBe(
            destination.body.station.departure[newDepartID]
              ? destination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });

      test('Journey should change start time with end time update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const destination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          const destinationID = destination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const tempInput = new Date(journey.endTime);
          tempInput.setTime(tempInput.getTime() - 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({ endTime: tempInput, departure: 1700209359420, token })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          expect(result.body.newJourney.startTime).toBe(endTime);
          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[destinationID]).toBe(
            initOldDepartStation.body.station.destination[destinationID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[destinationID]).toBe(
            initNewDeparture.body.station.destination[destinationID]
              ? initNewDeparture.body.station.destination[destinationID] + 1
              : 1,
          );
          const updatedDestination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            updatedDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDestination.body.station.departure[oldDepartID]).toBe(
            destination.body.station.departure[oldDepartID] - 1,
          );
          expect(updatedDestination.body.station.departure[newDepartID]).toBe(
            destination.body.station.departure[newDepartID]
              ? destination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });

      test('Journey should change start time with end time and duration update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const destination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          const destinationID = destination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const tempInput = new Date(endTime);
          tempInput.setTime(tempInput.getTime() + 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              endTime: tempInput.toISOString(),
              duration: 40,
              departure: 1700213059172,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 120000);
          expect(result.body.newJourney.startTime).toBe(time);
          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[destinationID]).toBe(
            initOldDepartStation.body.station.destination[destinationID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[destinationID]).toBe(
            initNewDeparture.body.station.destination[destinationID]
              ? initNewDeparture.body.station.destination[destinationID] + 1
              : 1,
          );
          const updatedDestination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            updatedDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDestination.body.station.departure[oldDepartID]).toBe(
            destination.body.station.departure[oldDepartID] - 1,
          );
          expect(updatedDestination.body.station.departure[newDepartID]).toBe(
            destination.body.station.departure[newDepartID]
              ? destination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });

      test('Journey should change all time correctly', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const destination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          const destinationID = destination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({ startTime: time, endTime, departure: 1700209359420, token })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          expect(result.body.newJourney.startTime).toBe(time);
          expect(result.body.newJourney.endTime).toBe(endTime);
          expect(result.body.newJourney.duration).toEqual(20);
          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[destinationID]).toBe(
            initOldDepartStation.body.station.destination[destinationID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[destinationID]).toBe(
            initNewDeparture.body.station.destination[destinationID]
              ? initNewDeparture.body.station.destination[destinationID] + 1
              : 1,
          );
          const updatedDestination = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            updatedDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDestination.body.station.departure[oldDepartID]).toBe(
            destination.body.station.departure[oldDepartID] - 1,
          );
          expect(updatedDestination.body.station.departure[newDepartID]).toBe(
            destination.body.station.departure[newDepartID]
              ? destination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });
    });

    describe('new destination station', () => {
      test('Journey should change end time with start time update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const departure = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          const departureID = departure.body.station.id;
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({ startTime: endTime, returnID: 1700211537126, token })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 20000);
          expect(result.body.newJourney.endTime).toBe(tempResult.toISOString());
          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[departureID]).toBe(
            initOldDestStation.body.station.departure[departureID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[departureID]).toBe(
            initNewDestination.body.station.departure[departureID]
              ? initNewDestination.body.station.departure[departureID] + 1
              : 1,
          );
          const updatedDeparture = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            updatedDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDeparture.body.station.destination[oldDestID]).toBe(
            departure.body.station.destination[oldDestID] - 1,
          );
          expect(updatedDeparture.body.station.destination[newDestID]).toBe(
            departure.body.station.destination[newDestID]
              ? departure.body.station.destination[newDestID] + 1
              : 1,
          );
        }
      });

      test('Journey should change end time with start time and duration update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const departure = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          const departureID = departure.body.station.id;
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const tempInput = new Date(endTime);
          tempInput.setTime(tempInput.getTime() + 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              startTime: tempInput.toISOString(),
              returnID: 1700211306241,
              duration: 100,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 120000);
          expect(result.body.newJourney.endTime).toBe(tempResult.toISOString());
          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[departureID]).toBe(
            initOldDestStation.body.station.departure[departureID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[departureID]).toBe(
            initNewDestination.body.station.departure[departureID]
              ? initNewDestination.body.station.departure[departureID] + 1
              : 1,
          );
          const updatedDeparture = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            updatedDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDeparture.body.station.destination[oldDestID]).toBe(
            departure.body.station.destination[oldDestID] - 1,
          );
          expect(updatedDeparture.body.station.destination[newDestID]).toBe(
            departure.body.station.destination[newDestID]
              ? departure.body.station.destination[newDestID] + 1
              : 1,
          );
        }
      });

      test('Journey should change start time with end time update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const departure = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          const departureID = departure.body.station.id;
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const tempInput = new Date(journey.endTime);
          tempInput.setTime(tempInput.getTime() - 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({ endTime: tempInput, returnID: 1700211537126, token })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          expect(result.body.newJourney.startTime).toBe(endTime);
          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[departureID]).toBe(
            initOldDestStation.body.station.departure[departureID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[departureID]).toBe(
            initNewDestination.body.station.departure[departureID]
              ? initNewDestination.body.station.departure[departureID] + 1
              : 1,
          );
          const updatedDeparture = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            updatedDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDeparture.body.station.destination[oldDestID]).toBe(
            departure.body.station.destination[oldDestID] - 1,
          );
          expect(updatedDeparture.body.station.destination[newDestID]).toBe(
            departure.body.station.destination[newDestID]
              ? departure.body.station.destination[newDestID] + 1
              : 1,
          );
        }
      });

      test('Journey should change start time with end time and duration update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const departure = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          const departureID = departure.body.station.id;
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const tempInput = new Date(endTime);
          tempInput.setTime(tempInput.getTime() + 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              endTime: tempInput.toISOString(),
              duration: 40,
              returnID: 1700211306241,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 120000);
          expect(result.body.newJourney.startTime).toBe(time);
          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[departureID]).toBe(
            initOldDestStation.body.station.departure[departureID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[departureID]).toBe(
            initNewDestination.body.station.departure[departureID]
              ? initNewDestination.body.station.departure[departureID] + 1
              : 1,
          );
          const updatedDeparture = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            updatedDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDeparture.body.station.destination[oldDestID]).toBe(
            departure.body.station.destination[oldDestID] - 1,
          );
          expect(updatedDeparture.body.station.destination[newDestID]).toBe(
            departure.body.station.destination[newDestID]
              ? departure.body.station.destination[newDestID] + 1
              : 1,
          );
        }
      });

      test('Journey should change all time correctly', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const departure = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          const departureID = departure.body.station.id;
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({ startTime: time, endTime, returnID: 1700211537126, token })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          expect(result.body.newJourney.startTime).toBe(time);
          expect(result.body.newJourney.endTime).toBe(endTime);
          expect(result.body.newJourney.duration).toEqual(20);
          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[departureID]).toBe(
            initOldDestStation.body.station.departure[departureID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[departureID]).toBe(
            initNewDestination.body.station.departure[departureID]
              ? initNewDestination.body.station.departure[departureID] + 1
              : 1,
          );
          const updatedDeparture = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            updatedDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(updatedDeparture.body.station.destination[oldDestID]).toBe(
            departure.body.station.destination[oldDestID] - 1,
          );
          expect(updatedDeparture.body.station.destination[newDestID]).toBe(
            departure.body.station.destination[newDestID]
              ? departure.body.station.destination[newDestID] + 1
              : 1,
          );
        }
      });
    });

    describe('change both station', () => {
      test('Journey should change end time with start time update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              startTime: endTime,
              departure: 1700213059172,
              returnID: 1700211306241,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 20000);
          expect(result.body.newJourney.endTime).toBe(tempResult.toISOString());

          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[oldDestID]).toBe(
            initOldDepartStation.body.station.destination[oldDestID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[newDestID]).toBe(
            initNewDeparture.body.station.destination[newDestID]
              ? initNewDeparture.body.station.destination[newDestID] + 1
              : 1,
          );

          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[oldDepartID]).toBe(
            initOldDestStation.body.station.departure[oldDepartID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[newDepartID]).toBe(
            initNewDestination.body.station.departure[newDepartID]
              ? initNewDestination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });

      test('Journey should change end time with start time and duration update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const tempInput = new Date(endTime);
          tempInput.setTime(tempInput.getTime() + 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              startTime: tempInput.toISOString(),
              departure: 1700209359420,
              returnID: 1700211537126,
              duration: 100,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 120000);
          expect(result.body.newJourney.endTime).toBe(tempResult.toISOString());

          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[oldDestID]).toBe(
            initOldDepartStation.body.station.destination[oldDestID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[newDestID]).toBe(
            initNewDeparture.body.station.destination[newDestID]
              ? initNewDeparture.body.station.destination[newDestID] + 1
              : 1,
          );

          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[oldDepartID]).toBe(
            initOldDestStation.body.station.departure[oldDepartID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[newDepartID]).toBe(
            initNewDestination.body.station.departure[newDepartID]
              ? initNewDestination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });

      test('Journey should change start time with end time update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const tempInput = new Date(journey.endTime);
          tempInput.setTime(tempInput.getTime() - 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              endTime: tempInput,
              departure: 1700213059172,
              returnID: 1700211306241,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          expect(result.body.newJourney.startTime).toBe(endTime);

          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[oldDestID]).toBe(
            initOldDepartStation.body.station.destination[oldDestID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[newDestID]).toBe(
            initNewDeparture.body.station.destination[newDestID]
              ? initNewDeparture.body.station.destination[newDestID] + 1
              : 1,
          );

          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[oldDepartID]).toBe(
            initOldDestStation.body.station.departure[oldDepartID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[newDepartID]).toBe(
            initNewDestination.body.station.departure[newDepartID]
              ? initNewDestination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });

      test('Journey should change start time with end time and duration update', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const tempInput = new Date(endTime);
          tempInput.setTime(tempInput.getTime() + 20000);
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              endTime: tempInput.toISOString(),
              duration: 40,
              departure: 1700209359420,
              returnID: 1700211537126,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          const tempResult = new Date(endTime);
          tempResult.setTime(tempResult.getTime() + 120000);
          expect(result.body.newJourney.startTime).toBe(time);

          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[oldDestID]).toBe(
            initOldDepartStation.body.station.destination[oldDestID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700209359420')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[newDestID]).toBe(
            initNewDeparture.body.station.destination[newDestID]
              ? initNewDeparture.body.station.destination[newDestID] + 1
              : 1,
          );

          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[oldDepartID]).toBe(
            initOldDestStation.body.station.departure[oldDepartID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211537126')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[newDepartID]).toBe(
            initNewDestination.body.station.departure[newDepartID]
              ? initNewDestination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });

      test('Journey should change all time correctly', async () => {
        const journey = await Journey.findById(id);
        if (journey) {
          const initOldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          const initOldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          const initNewDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          const initNewDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          const oldDestID = initOldDestStation.body.station.id;
          const newDestID = initNewDestination.body.station.id;
          const oldDepartID = initOldDepartStation.body.station.id;
          const newDepartID = initNewDeparture.body.station.id;
          const result = await api
            // eslint-disable-next-line no-underscore-dangle
            .put(`/api/journeys/${journey._id}`)
            .send({
              startTime: time,
              endTime,
              departure: 1700213059172,
              returnID: 1700211306241,
              token,
            })
            .expect(200)
            .expect('Content-Type', /application\/json/);
          expect(result.body.newJourney.startTime).toBe(time);
          expect(result.body.newJourney.endTime).toBe(endTime);
          expect(result.body.newJourney.duration).toEqual(20);

          const oldDepartStation = await api
            .get(`/api/stations/sid/${journey.departure}`)
            .expect(200);
          expect(
            oldDepartStation.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDepartStation.body.station.destination[oldDestID]).toBe(
            initOldDepartStation.body.station.destination[oldDestID] - 1,
          );
          const newDeparture = await api
            .get('/api/stations/sid/1700213059172')
            .expect(200);
          expect(
            newDeparture.body.station.journeys.depart,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDeparture.body.station.destination[newDestID]).toBe(
            initNewDeparture.body.station.destination[newDestID]
              ? initNewDeparture.body.station.destination[newDestID] + 1
              : 1,
          );

          const oldDestStation = await api
            .get(`/api/stations/sid/${journey.returnID}`)
            .expect(200);
          expect(
            oldDestStation.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).not.toContain(journey._id.toString());
          expect(oldDestStation.body.station.departure[oldDepartID]).toBe(
            initOldDestStation.body.station.departure[oldDepartID] - 1,
          );
          const newDestination = await api
            .get('/api/stations/sid/1700211306241')
            .expect(200);
          expect(
            newDestination.body.station.journeys.arrive,
            // eslint-disable-next-line no-underscore-dangle
          ).toContain(journey._id.toString());
          expect(newDestination.body.station.departure[newDepartID]).toBe(
            initNewDestination.body.station.departure[newDepartID]
              ? initNewDestination.body.station.departure[newDepartID] + 1
              : 1,
          );
        }
      });
    });
  });

  test('Journey can be deleted', async () => {
    const journey = await Journey.findById(id);
    if (journey) {
      const departSID = journey.departure;
      const destSID = journey.returnID;
      const oldDepartStation = await api
        .get(`/api/stations/sid/${departSID}`)
        .expect(200);
      const oldDestStation = await api
        .get(`/api/stations/sid/${destSID}`)
        .expect(200);
      await api.delete(`/api/journeys/${id}`).send({ token }).expect(204);
      const departStation = await api
        .get(`/api/stations/sid/${departSID}`)
        .expect(200);
      const destStation = await api
        .get(`/api/stations/sid/${destSID}`)
        .expect(200);
      if (departStation && destStation && oldDepartStation && oldDestStation) {
        expect(departStation.body.station.journeys.depart).not.toContain(id);
        expect(
          departStation.body.station.destination[
            oldDestStation.body.station.id
          ],
        ).toBe(
          oldDepartStation.body.station.destination[
            oldDestStation.body.station.id
          ] - 1,
        );

        expect(destStation.body.station.journeys.arrive).not.toContain(id);
        expect(
          destStation.body.station.departure[oldDepartStation.body.station.id],
        ).toBe(
          oldDestStation.body.station.departure[
            oldDepartStation.body.station.id
          ] - 1,
        );
      }
    }
  });
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
