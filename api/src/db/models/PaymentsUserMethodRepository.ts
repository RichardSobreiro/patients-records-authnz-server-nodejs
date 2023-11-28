/** @format */

import mongoose, { Schema } from "mongoose";
import PaymentsUserMethodStatus from "../../constants/PaymentsUserMethodStatus";
import PaymentMethods from "../../constants/PaymentMethods";

const PaymentsSchema = new Schema({
  paymentUserMethodId: {
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
  isDefault: {
    type: Boolean,
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
    encryptedCard: {
      type: String,
      required: false,
    },
    cardToken: {
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
    expiry: {
      type: String,
      required: false,
    },
    brand: {
      type: String,
      required: false,
    },
  },
});

interface PaymentsUserMethod {
  paymentUserMethodId: string;
  userId: string;
  creationDate: Date;
  paymentMethodId: PaymentMethods;
  isDefault: boolean;
  status: PaymentsUserMethodStatus;
  statusDescription: string;
  expireDate?: Date;
  creditCard?: {
    fourFinalNumbers: string;
    cvc: string;
    holderName: string;
    expiry: string;
    brand: string;
    encryptedCard?: string;
    cardToken?: string;
  };
}

export const PaymentsUserMethodRepository = mongoose.model<PaymentsUserMethod>(
  "PaymentsUserMethod",
  PaymentsSchema
);
