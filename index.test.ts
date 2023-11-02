import {describe, expect, jest, test} from "@jest/globals";
import dotenv from "dotenv";
import {run} from "./index";

dotenv.config();

describe('Test database logic', () => {
  test('Database can connect', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const mongoURL = process.env.MONGODB_URL;
    await run(mongoURL);
    expect(consoleSpy).toHaveBeenCalledWith('Mongoose connected');
  })
});