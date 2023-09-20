/** @format */

import mongoose, { Schema } from "mongoose";
import { GetQuestionItem } from "../../models/customers/anamnesis/anamnesis-types/GetAnamnesisTypesResponse";

export interface AnamnesisType {
  userId?: string;
  creationDate: Date;
  anamnesisTypeId: string;
  anamnesisTypeDescription: string;
  isDefault: boolean;
  template: string | null;
  questions: GetQuestionItem[] | undefined;
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
    },
  ],
});

export const AnamnesisTypeRepository = mongoose.model<AnamnesisType>(
  "AnamnesisTypes",
  AnamnesisTypesSchema
);
