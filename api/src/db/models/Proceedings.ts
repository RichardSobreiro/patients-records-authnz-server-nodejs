/** @format */

import mongoose, { Schema } from "mongoose";

interface Proceeding {
  proceedingId: string;
  creationDate: Date;
  patientId: string;
  date: Date;
  proceedingTypeId: string;
  notes: string;
}

const ProceedingsSchema = new Schema({
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
  patientId: {
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
