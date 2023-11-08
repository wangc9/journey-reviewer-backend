import express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { auth } from 'firebase-admin';
import User from '../models/user';
import firebaseAdmin from '../config/firebase_admin_config';

const userRouter = express.Router();

/**
 * returns all users from database
 */
userRouter.get('/', async (_request, response) => {
  const users = await User.find({});
  response.json(users);
});

/**
 * receive token from firebase, decode and create new user, return new user
 */
userRouter.post('/', async (request, response) => {
  const { username, token } = request.body;
  const decodedToken = await auth(firebaseAdmin).verifyIdToken(token);
  // eslint-disable-next-line prefer-destructuring
  const uid = decodedToken.uid;
  const user = new User({
    username,
    uid,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

export default userRouter;
