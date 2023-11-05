import express from 'express';
// eslint-disable-next-line import/no-extraneous-dependencies
import cors from 'cors';
import User from './src/models/user';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/users', (_request, response) => {
  User.find({}).then((users) => {
    response.json(users);
  });
});

app.post('/api/users', (request, response) => {
  const { username } = request.body;

  const user = new User({
    username,
  });

  // @ts-ignore
  user.save().then((savedUser: any) => {
    response.status(201).json(savedUser);
  });
});

export default app;
