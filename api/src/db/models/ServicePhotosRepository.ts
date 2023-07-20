/** @format */

import mongoose, { Schema } from "mongoose";

export interface ServicePhoto {
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

const ServicePhotosSchema = new Schema({
  servicePhotoId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  serviceId: {
    type: String,
    required: true,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
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

export const ServicePhotosRepository = mongoose.model<ServicePhoto>(
  "ServicePhotosRepository",
  ServicePhotosSchema
);
