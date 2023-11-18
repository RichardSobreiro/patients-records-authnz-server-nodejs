/** @format */

import mongoose, { Schema } from "mongoose";

interface Payments {
  paymentId: string;
  userId: string;
  creationDate: Date;
  paymentMethodId: string;
  description: string;
  paymentStatus: string;
  expireDate?: Date;
  creditCard?: {
    numberEncrypted: string;
    cvc: string;
    holderName: string;
    expireData: string;
    brand: string;
  };
}

const PaymentsSchema = new Schema({
  paymentId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  paymentMethodId: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    required: true,
  },
  expireDate: {
    type: Date,
  },
  creditCard: {
    numberEncrypted: {
      type: String,
      required: false,
    },
    cvc: {
      type: String,
      required: false,
    },
    holderName: {
      type: String,
      required: false,
    },
    expireData: {
      type: Date,
      required: false,
    },
    brand: {
      type: String,
      required: false,
    },
  },
});

export const PaymentsRepository = mongoose.model<Payments>(
  "Payments",
  PaymentsSchema
);
