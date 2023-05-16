/** @format */

import mongoose, { Schema } from "mongoose";

export interface ProceedingType {
  userId: string;
  creationDate: Date;
  proceedingTypeId: string;
  proceedingTypeDescription: string;
  notes: string | null;
}

const ProceedingTypesSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  proceedingTypeId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  proceedingTypeDescription: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
});

export const ProceedingTypes = mongoose.model<ProceedingType>(
  "ProceedingTypes",
  ProceedingTypesSchema
);
