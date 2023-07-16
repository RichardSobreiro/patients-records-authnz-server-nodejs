/** @format */

import mongoose, { Schema } from "mongoose";

interface Anamnese {
  anamneseId: string;
  customerId: string;
  creationDate: Date;
  date: Date;
  type: string[];
  birthDate: Date;
  freeTypeText?: string;
  gender?: string;
  ethnicity?: string;
  maritalStatus?: string;
  employmentStatus?: string;
  comments?: string;
}

const AnamneseSchema = new Schema({
  anamneseId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  customerId: {
    type: String,
    required: true,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: [String],
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  freeTypeText: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  ethnicity: {
    type: String,
    required: false,
  },
  maritalStatus: {
    type: String,
    required: false,
  },
  employmentStatus: {
    type: String,
    required: false,
  },
  comments: {
    type: String,
    required: false,
  },
});

export const AnamneseRepository = mongoose.model<Anamnese>(
  "Anamnese",
  AnamneseSchema
);
