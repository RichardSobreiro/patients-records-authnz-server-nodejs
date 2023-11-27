/** @format */

import mongoose, { Schema } from "mongoose";

const AccountSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  paymentStatus: {
    type: String,
    required: false,
  },
  paymentStatusDescription: {
    type: String,
    required: false,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userNameComplete: {
    type: String,
    required: false,
  },
  userBirthdate: {
    type: Date,
    required: false,
  },
  userCPF: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
  },
  userCreationCompleted: {
    type: Boolean,
    default: false,
    required: true,
  },
  dateCreationCompleted: {
    type: Date,
    required: false,
  },
  userPlanId: {
    type: String,
    default: "1",
    required: false,
  },
  companyName: {
    type: String,
    required: false,
  },
  companyCNPJ: {
    type: String,
    required: false,
  },
  companyNumberOfEmployees: {
    type: Number,
    required: false,
  },
  referPronoun: {
    type: String,
    required: false,
  },
  messageProfessionalName: {
    type: String,
    required: false,
  },
  phoneAreaCode: {
    type: String,
    required: false,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  phoneNumberVerified: {
    type: String,
    required: false,
  },
  userAddressCEP: {
    type: String,
    required: false,
  },
  userAddressStreet: {
    type: String,
    required: false,
  },
  userAddressNumber: {
    type: String,
    required: false,
  },
  userAddressDistrict: {
    type: String,
    required: false,
  },
  userAddressCity: {
    type: String,
    required: false,
  },
  userAddressComplement: {
    type: String,
    required: false,
  },
  userAddressState: {
    type: String,
    required: false,
  },
  paymentInfo: {
    type: Object,
    required: false,
  },
});

export interface Account {
  userId: string;
  email: string;
  creationDate: Date;
  emailVerified?: boolean | undefined;
  paymentStatus?: string;
  paymentStatusDescription?: string;
  username: string;
  userNameComplete?: string | undefined;
  userBirthdate?: Date;
  userCPF?: string;
  gender?: string;
  password?: string;
  userCreationCompleted: boolean;
  dateCreationCompleted?: Date;
  userPlanId?: string;
  companyName?: string;
  companyCNPJ?: string;
  companyNumberOfEmployees?: number;
  referPronoun?: string;
  messageProfessionalName?: string;
  phoneAreaCode?: string;
  phoneNumber?: string;
  phoneNumberVerified?: boolean | undefined;
  userAddressCEP?: string;
  userAddressStreet?: string;
  userAddressNumber?: string;
  userAddressDistrict?: string;
  userAddressCity?: string;
  userAddressComplement?: string;
  userAddressState?: string;
}

export const AccountRepository = mongoose.model<Account>(
  "Account",
  AccountSchema
);
