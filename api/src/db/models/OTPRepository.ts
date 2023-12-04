/** @format */

import mongoose, { Schema } from "mongoose";
import OTPType from "../../constants/OTPType";

const OTPSchema = new Schema({
  otp: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  otpType: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  expirationTime: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: false,
  },
  verified: {
    type: Boolean,
    required: false,
  },
});

export interface OTP {
  otp: string;
  userId: string;
  otpType: OTPType;
  createdAt: Date;
  expirationTime: Date;
  updatedAt?: Date;
  verified?: boolean;
}

export const OTPRepository = mongoose.model<OTP>("OTP", OTPSchema);
