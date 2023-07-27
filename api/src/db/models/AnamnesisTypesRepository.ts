/** @format */

import mongoose, { Schema } from "mongoose";

export interface AnamnesisType {
  userId?: string;
  creationDate: Date;
  anamnesisTypeId: string;
  anamnesisTypeDescription: string;
  isDefault: boolean;
  template: string | null;
}

const AnamnesisTypesSchema = new Schema({
  userId: {
    type: String,
    required: false,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  anamnesisTypeId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  anamnesisTypeDescription: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    required: true,
  },
  template: {
    type: String,
  },
});

export const AnamnesisTypeRepository = mongoose.model<AnamnesisType>(
  "AnamnesisTypes",
  AnamnesisTypesSchema
);
