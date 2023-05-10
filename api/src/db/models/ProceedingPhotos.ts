/** @format */

import mongoose, { Schema } from "mongoose";

export interface ProceedingPhoto {
  proceedingId: string;
  creationDate: Date;
  proceedingPhotoId: string;
  proceedingPhotoType: string;
  mimeType: string;
  imageType: string;
  contentEncoding: string;
  filename: string;
  baseUrl: string;
  sasToken: string;
  sasTokenExpiresOn: Date;
}

const ProceedingPhotosSchema = new Schema({
  proceedingId: {
    type: String,
    required: true,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  proceedingPhotoId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  proceedingPhotoType: {
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
