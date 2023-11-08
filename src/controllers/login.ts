import express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import { auth } from 'firebase-admin';
import firebaseAdmin from '../config/firebase_admin_config';
import User from '../models/user';

const loginRouter = express.Router();

loginRouter.post('/', async (request, response) => {
  const { token } = request.body;
  const decodedToken = await auth(firebaseAdmin).verifyIdToken(token);
  const { uid } = decodedToken;
  const user = await User.findOne({ uid });
  response.json({ user });
});

export default loginRouter;
