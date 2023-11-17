// eslint-disable-next-line import/no-extraneous-dependencies
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
  xtest,
} from '@jest/globals';
import mongoose from 'mongoose';
import firebaseClient from '../utils/firebase_client_config';
import app from '../../app';
import Journey, { IJourney } from '../models/journey';

const api = supertest(app);

const auth = getAuth(firebaseClient);

describe('Test journey without login', () => {
  test('Can not add journey without login', async () => {
    const testJourney: Omit<IJourney, 'user'> = {
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

  beforeAll(() => {
    const date = new Date();
    time = date.toISOString();
    date.setSeconds(date.getSeconds() + 20);
    endTime = date.toISOString();
  });

  test('Add journey successful with correct credientials', async () => {
    const testJourney: Omit<IJourney, 'user'> = {
      startTime: time,
      endTime,
      departure: 1700209396660,
      returnID: 1700209425434,
      distance: 25,
    };
    await signInWithEmailAndPassword(
      auth,
      'test1699277335156@test.com',
      'qwerty123',
    );
    const token = await auth.currentUser?.getIdToken(true);
    const result = await api
      .post('/api/journeys')
      .send({ ...testJourney, token })
      .expect(201)
      .expect('Content-Type', /application\/json/);
    expect(result.body.journey.startTime).toBe(time);
    expect(result.body.journey.duration).toBe(20);
    expect(result.body.updatedUser.journeys).toContain(result.body.journey.id);
  });

  xtest('Journey can be updated', async () => {
    await signInWithEmailAndPassword(
      auth,
      'test1699277335156@test.com',
      'qwerty123',
    );
    const token = await auth.currentUser?.getIdToken(true);
    const journey = await Journey.findOne({ departure: time });
    if (journey) {
      const result = await api
        // eslint-disable-next-line no-underscore-dangle
        .put(`/api/journeys/${journey._id}`)
        .send({ distance: 50, token })
        .expect(201)
        .expect('Content-Type', /application\/json/);
      expect(result.body.newStation.distance).toBe(50);
    }
  });
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
