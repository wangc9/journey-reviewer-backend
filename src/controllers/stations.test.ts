// eslint-disable-next-line import/no-extraneous-dependencies
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import firebaseClient from '../utils/firebase_client_config';
import app from '../../app';
import Station from '../models/station';

const api = supertest(app);

const auth = getAuth(firebaseClient);

describe('Test station without login', () => {
  test('Can not add station without login', async () => {
    const testStation = {
      SId: 1,
      Nimi: 'test',
      Namn: 'test',
      Name: 'test',
      Osoite: 'test',
      Adress: 'test',
      Kaupunki: 'Helsinki',
      Stad: 'Helsingfors',
      Capacity: 0,
      x: 60.000001,
      y: 52.511112,
    };
    await api.post('/api/stations').send(testStation).expect(401);
  });
});

describe('Test station database logic', () => {
  let time: number;
  let token: string | undefined;

  beforeAll(async () => {
    const date = new Date();
    time = date.getTime();
    await signInWithEmailAndPassword(
      auth,
      'test1699277335156@test.com',
      'qwerty123',
    );
    token = await auth.currentUser?.getIdToken(true);
  });

  test('Add station successful with correct credientials', async () => {
    const testStation = {
      SId: time,
      Nimi: 'test s',
      Namn: 'test s',
      Name: 'test s',
      Osoite: 'test s',
      Adress: 'test s',
      Kaupunki: 'Helsinki',
      Stad: 'Helsingfors',
      Capacity: 1,
      x: 60.000001,
      y: 52.511112,
    };
    const result = await api
      .post('/api/stations')
      .send({ ...testStation, token })
      .expect(201)
      .expect('Content-Type', /application\/json/);
    expect(result.body.station.SId).toBe(time);
    expect(result.body.updatedUser.stations).toContain(result.body.station.id);
  });

  test('Can not add station with existing SId', async () => {
    const testStation = {
      SId: time,
      Nimi: 'test r',
      Namn: 'test r',
      Name: 'test r',
      Osoite: 'test r',
      Adress: 'test r',
      Kaupunki: 'Helsinki',
      Stad: 'Helsingfors',
      Capacity: 1,
      x: 60.000001,
      y: 52.511112,
    };
    const result = await api
      .post('/api/stations')
      .send({ ...testStation, token })
      .expect(401)
      .expect('Content-Type', /application\/json/);
    expect(result.body.error).toContain('expected `SId` to be unique');
  });

  test('Station can be updated', async () => {
    const station = await Station.findOne({ SId: time });
    if (station) {
      const result = await api
        // eslint-disable-next-line no-underscore-dangle
        .put(`/api/stations/${station._id}`)
        .send({ Nimi: 'testi s', token })
        .expect(201)
        .expect('Content-Type', /application\/json/);
      expect(result.body.newStation.Nimi).toBe('testi s');
    }
  });

  test('Empty station can be deleted', async () => {
    const station = await Station.findOne({ SId: time });
    if (station) {
      await api
        // eslint-disable-next-line no-underscore-dangle
        .delete(`/api/stations/${station._id}`)
        .send({ token })
        .expect(204);
      const temp = await Station.findOne({ SId: time });
      expect(temp).toBe(null);
    }
  });

  test('Can not delete occupied station', async () => {
    const station = await Station.findOne({ SId: 1700209396660 });
    if (station) {
      const result = await api
        // eslint-disable-next-line no-underscore-dangle
        .delete(`/api/stations/${station._id}`)
        .send({ token })
        .expect(403)
        .expect('Content-Type', /application\/json/);
      expect(result.body.error).toContain(
        'please delete all its attached journeys first',
      );
    }
  });
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
