import dotenv from 'dotenv';
import app from './app';

dotenv.config();

// eslint-disable-next-line prefer-destructuring
const PORT = process.env.PORT;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
