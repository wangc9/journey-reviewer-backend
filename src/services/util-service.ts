/* eslint-disable import/prefer-default-export */
import { Request } from 'express';
import { auth } from 'firebase-admin';
import firebaseAdmin from '../utils/firebase_admin_config';
import User from '../models/user';

export const checkToken = async (request: Request, action: string) => {
  const { token, ...body } = request.body;
  if (token === undefined) {
    return {
      authError: `Only logged-in users can ${action}, please log in or sign up first`,
    };
  }
  const decodedToken = await auth(firebaseAdmin).verifyIdToken(token);
  if (!decodedToken) {
    return {
      authError: 'Invalid user',
    };
  }
  const { uid } = decodedToken;
  const user = await User.findOne({ uid });
  if (user === null) {
    return {
      authError: 'User not found',
    };
  }
  return { body, user };
};
