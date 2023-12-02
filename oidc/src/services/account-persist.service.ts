/** @format */

import { Account } from "../db/mongodb/models/Account";

export const get = async (key: string) => await Account.findOne({ email: key });
export const getByUsername = async (username: string) =>
  await Account.findOne({ username: username });
export const set = async (key: string, value: any) =>
  await Account.insertMany(value);
