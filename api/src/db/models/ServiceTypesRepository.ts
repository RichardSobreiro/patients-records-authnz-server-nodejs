/** @format */

import mongoose, { Schema } from "mongoose";

export interface ServiceType {
  userId?: string;
  creationDate: Date;
  serviceTypeId: string;
  serviceTypeDescription: string;
  isDefault: boolean;
  notes: string | null;
}

const ServiceTypesSchema = new Schema({
  userId: {
    type: String,
    required: false,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  serviceTypeId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  serviceTypeDescription: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    required: true,
  },
  notes: {
    type: String,
  },
});

export const ServiceTypeRepository = mongoose.model<ServiceType>(
  "ServiceTypes",
  ServiceTypesSchema
);
