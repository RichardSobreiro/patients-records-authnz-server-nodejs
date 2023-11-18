/** @format */

import mongoose, { Schema } from "mongoose";
import PaymentInstalmentsStatus from "../../enums/PaymentStatus";

interface PaymentInstalments {
  paymentInstalmentsId: string;
  paymentId: string;
  userId: string;
  creationDate: Date;
  expireDate?: Date;
  instalmentNumber: string;
  status: PaymentInstalmentsStatus;
  paymentProcessorResponse?: any;
}

const PaymentInstalmentsSchema = new Schema({
  paymentInstalmentsId: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  paymentId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  expireDate: {
    type: Date,
    required: false,
  },
  instalmentNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  paymentProcessorResponse: {
    type: Object,
    required: false,
  },
});

export const PaymentInstalmentsRepository = mongoose.model<PaymentInstalments>(
  "PaymentInstalments",
  PaymentInstalmentsSchema
);
