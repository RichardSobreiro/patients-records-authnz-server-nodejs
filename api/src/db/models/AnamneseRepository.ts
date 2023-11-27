/** @format */

import mongoose, { Schema } from "mongoose";
import { CreateAnamnesisTypeContentRequest } from "../../models/customers/CreateAnamneseRequest";

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
            index: true,
          },
          creationDate: {
            type: Date,
          },
          mimeType: {
            type: String,
          },
          fileType: {
            type: String,
          },
          contentEncoding: {
            type: String,
          },
          filename: {
            type: String,
          },
          originalName: {
            type: String,
          },
          baseUrl: {
            type: String,
          },
          sasToken: {
            type: String,
          },
          sasTokenExpiresOn: {
            type: Date,
          },
        },
      ],
      questions: [
        {
          questionItemId: {
            type: String,
            required: true,
          },
          questionType: {
            type: String,
            required: true,
          },
          questionPhrase: {
            type: String,
            required: true,
          },
          questionAnswersOptions: [
            {
              type: String,
            },
          ],
          questionValue: {
            type: String,
          },
          sectionId: {
            type: String,
          },
        },
      ],
      sections: [
        {
          sectionId: {
            type: String,
            required: true,
            index: true,
          },
          sectionTitle: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
});

export interface Anamnese {
  anamneseId: string;
  customerId: string;
  creationDate: Date;
  date: Date;
  anamnesisTypesContent: CreateAnamnesisTypeContentRequest[];
}

export const AnamneseRepository = mongoose.model<Anamnese>(
  "Anamnese",
  AnamneseSchema
);
