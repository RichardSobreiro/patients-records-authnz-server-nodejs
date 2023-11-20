/** @format */

import mongoose, { Schema } from "mongoose";
import PaymentsUserMethodStatus from "../../enums/PaymentsUserMethodStatus";
import PaymentMethods from "../../enums/PaymentMethods";

const PaymentsSchema = new Schema({
  paymentsUserMethodId: {
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
  statusDescription: {
    type: String,
    required: true,
  },
  status: {
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
    fourFinalNumbers: {
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

interface PaymentsUserMethod {
  paymentsUserMethodId: string;
  userId: string;
  creationDate: Date;
  paymentMethodId: PaymentMethods;
  status: PaymentsUserMethodStatus;
  statusDescription: string;
  expireDate?: Date;
  creditCard?: {
    numberEncrypted: string;
    fourFinalNumbers: string;
    cvc: string;
    holderName: string;
    expireData: string;
    brand: string;
  };
}

export const PaymentsUserMethodRepository = mongoose.model<PaymentsUserMethod>(
  "PaymentsUserMethod",
  PaymentsSchema
);
