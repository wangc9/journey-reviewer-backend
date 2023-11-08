// eslint-disable-next-line import/no-extraneous-dependencies
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import firebaseClient from '../config/firebase_client_config';
import app from '../../app';
import User from '../models/user';

const api = supertest(app);

const clientAuth = getAuth(firebaseClient);

describe('Test user database logic', () => {
  let userCount = 0;

  beforeAll(async () => {
    userCount = await User.count();
  });

  test('Database can connect', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('Can add new user', async () => {
    const date = new Date();
    const time = date.getTime();
    await createUserWithEmailAndPassword(
      clientAuth,
      `test${time}@test.com`,
      'qwerty123',
    );
    const token = await clientAuth.currentUser?.getIdToken(true);
    await api
      .post('/api/users')
      .send({ username: `test${time}`, token })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const users = await User.find({});
    expect(users).toHaveLength(userCount + 1);

    // @ts-ignore
    const usernames = users.map((user) => user.username);
    expect(usernames).toContain(`test${time}`);
  });
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
