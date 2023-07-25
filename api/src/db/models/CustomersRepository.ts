/** @format */

import mongoose, { Schema } from "mongoose";

interface Customer {
  userId: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  birthDate: Date;
  creationDate: Date;
  email?: string;
  mostRecentProceedingId?: string;
  mostRecentProceedingDate?: Date;
  mostRecentProceedingAfterPhotoUrl?: string;
}

const CustomersSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  customerId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  customerName: {
    type: String,
    required: true,
    index: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
  },
  mostRecentProceedingId: {
    type: String,
  },
  mostRecentProceedingDate: {
    type: Date,
  },
  mostRecentProceedingAfterPhotoUrl: {
    type: String,
  },
});

export const CustomersRepository = mongoose.model<Customer>(
  "Customers",
  CustomersSchema
);
