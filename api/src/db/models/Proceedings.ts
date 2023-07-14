/** @format */

import mongoose, { Schema } from "mongoose";

interface Proceeding {
  userId: string;
  proceedingId: string;
  creationDate: Date;
  customerId: string;
  date: Date;
  proceedingTypeId: string;
  notes: string;
}

const ProceedingsSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  proceedingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
    index: true,
  },
  customerId: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  proceedingTypeId: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
});

export const Proceedings = mongoose.model<Proceeding>(
  "Proceedings",
  ProceedingsSchema
);
