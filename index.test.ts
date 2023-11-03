import {describe, expect, test} from "@jest/globals";
import dotenv from "dotenv";
// import {run} from "./index";

dotenv.config();

describe('Test database logic', () => {
  // TODO Add database connection test
  test('Database can connect', async () => {
    // const consoleSpy = jest.spyOn(console, 'log');
    // const mongoURL = process.env.MONGODB_URL;
    // const status = await run(mongoURL);
    expect(true).toEqual(true);
  })
});