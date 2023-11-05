import mongoose from 'mongoose';
// eslint-disable-next-line import/no-extraneous-dependencies
import supertest from 'supertest';
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterAll, beforeEach, describe, expect, test } from '@jest/globals';
import dotenv from 'dotenv';
import app from './app';
import User from './src/models/user';

dotenv.config();

const api = supertest(app);

describe('Database logic test', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('Database can connect', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('Can register new user', async () => {
    await api
      .post('/api/users')
      .send({ username: 'admin' })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const currentUsers = await User.find({});
    expect(currentUsers).toHaveLength(1);

    // @ts-ignore
    const usernames = currentUsers.map((user) => user.username);
    expect(usernames).toContain('admin');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
