// eslint-disable-next-line import/no-extraneous-dependencies
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
import { afterAll, describe, expect, test } from '@jest/globals';
import mongoose from 'mongoose';
import firebaseClient from '../utils/firebase_client_config';
import app from '../../app';

const api = supertest(app);

const auth = getAuth(firebaseClient);

describe('Test sign-in logic', () => {
  test('Login successful with correct credientials', async () => {
    await signInWithEmailAndPassword(
      auth,
      'test1699277335156@test.com',
      'qwerty123',
    );
    const token = await auth.currentUser?.getIdToken(true);
    const result = await api
      .post('/api/login')
      .send({ token })
      .expect(200)
      .expect('Content-Type', /application\/json/);
    expect(result.body.user.username).toBe('test1699277335156');
  });

  afterAll((done) => {
    mongoose.connection.close();
    done();
  });
});
