/** @format */

import mongoose, { Schema } from "mongoose";

const AccountSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: false,
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
  userCreationCompleted: {
    type: Boolean,
    default: false,
    required: true,
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
  userNameComplete: {
    type: String,
    required: false,
  },
  userCPF: {
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
    required: true,
  },
});

export const Account = mongoose.model<any>("Account", AccountSchema);
