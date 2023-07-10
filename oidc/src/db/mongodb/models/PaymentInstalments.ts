/** @format */

import mongoose, { Schema } from "mongoose";

export enum PAYMENT_INSTALMENT_STATUS {
  OK,
  PENDING,
  ERROR,
}

const PaymentInstalmentsSchema = new Schema({
  username: {
    type: String,
    required: true,
    index: true,
    unique: false,
  },
  paymentInfoId: {
    type: String,
    required: true,
    index: true,
    unique: false,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  instalmentNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  paymentProcessorResponse: {
    type: Object,
    required: false,
  },
});

export const PaymentInstalments = mongoose.model<any>(
  "PaymentInstalments",
  PaymentInstalmentsSchema
);
