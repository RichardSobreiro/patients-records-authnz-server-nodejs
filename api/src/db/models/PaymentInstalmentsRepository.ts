/** @format */

import mongoose, { Schema } from "mongoose";
import PaymentInstalmentsStatus from "../../constants/PaymentInstalmentsStatus";

const PaymentInstalmentsSchema = new Schema({
  paymentInstalmentsId: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  paymentUserMethodId: {
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
  paymentDate: {
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
  statusDescription: {
    type: String,
    required: true,
  },
  paymentProcessorResponse: {
    type: Object,
    required: false,
  },
});

interface PaymentInstalments {
  paymentInstalmentsId: string;
  paymentUserMethodId: string;
  userId: string;
  creationDate: Date;
  expireDate?: Date;
  paymentDate?: Date;
  instalmentNumber: string;
  status: PaymentInstalmentsStatus;
  statusDescription: string;
  paymentProcessorResponse?: any;
}

export const PaymentInstalmentsRepository = mongoose.model<PaymentInstalments>(
  "PaymentInstalments",
  PaymentInstalmentsSchema
);
