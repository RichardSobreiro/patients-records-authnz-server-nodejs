/** @format */

import mongoose, { Schema } from "mongoose";

export interface ProceedingPhoto {
  serviceId: string;
  creationDate: Date;
  servicePhotoId: string;
  servicePhotoType: string;
  mimeType: string;
  imageType: string;
  contentEncoding: string;
  filename: string;
  baseUrl: string;
  sasToken: string;
  sasTokenExpiresOn: Date;
}

const ProceedingPhotosSchema = new Schema({
  serviceId: {
    type: String,
    required: true,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  servicePhotoId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  servicePhotoType: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  imageType: {
    type: String,
    required: true,
  },
  contentEncoding: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  baseUrl: {
    type: String,
    required: true,
  },
  sasToken: {
    type: String,
    required: true,
  },
  sasTokenExpiresOn: {
    type: Date,
    required: true,
  },
});

export const ProceedingPhotos = mongoose.model<ProceedingPhoto>(
  "ProceedingPhotos",
  ProceedingPhotosSchema
);
