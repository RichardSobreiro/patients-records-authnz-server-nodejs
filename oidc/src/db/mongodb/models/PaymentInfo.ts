/** @format */

import mongoose, { Schema } from "mongoose";

const PaymentInfoSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  paymentTypeCode: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  creditCardEncrypted: {
    type: String,
    required: false,
  },
  securityCode: {
    type: String,
    required: false,
  },
  holderName: {
    type: String,
    required: false,
  },
  paymentOk: {
    type: Boolean,
    required: true,
    default: false,
  },
  paymentValidUntil: {
    type: Date,
    required: false,
  },
});

export const PaymentInfo = mongoose.model<any>(
  "PaymentInfo",
  PaymentInfoSchema
);
