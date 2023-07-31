/** @format */

import mongoose, { Schema } from "mongoose";
import { CreateAnamnesisTypeContentRequest } from "../../models/customers/CreateAnamneseRequest";

export interface Anamnese {
  anamneseId: string;
  customerId: string;
  creationDate: Date;
  date: Date;
  anamnesisTypesContent: CreateAnamnesisTypeContentRequest[];
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
  anamnesisTypesContent: [
    {
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
      content: {
        type: String,
      },
      files: [
        {
          fileId: {
            type: String,
            required: true,
            unique: true,
            index: true,
          },
          creationDate: {
            type: Date,
            required: true,
          },
          mimeType: {
            type: String,
            required: true,
          },
          fileType: {
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
          originalName: {
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
        },
      ],
    },
  ],
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
