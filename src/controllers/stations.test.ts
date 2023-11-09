// eslint-disable-next-line import/no-extraneous-dependencies
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import firebaseClient from '../config/firebase_client_config';
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

  beforeAll(() => {
    const date = new Date();
    time = date.getTime();
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
    await signInWithEmailAndPassword(
      auth,
      'test1699277335156@test.com',
      'qwerty123',
    );
    const token = await auth.currentUser?.getIdToken(true);
    const result = await api
      .post('/api/stations')
      .send({ ...testStation, token })
      .expect(201)
      .expect('Content-Type', /application\/json/);
    expect(result.body.station.SId).toBe(time);
    expect(result.body.updatedUser.stations).toContain(result.body.station.id);
  });

  test('Station can be updated', async () => {
    await signInWithEmailAndPassword(
      auth,
      'test1699277335156@test.com',
      'qwerty123',
    );
    const token = await auth.currentUser?.getIdToken(true);
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
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
