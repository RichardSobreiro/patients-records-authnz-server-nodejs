/** @format */

import mongoose, { Schema } from "mongoose";

interface Customer {
  userId: string;
  customerId: string;
  creationDate: Date;
  customerName: string;
  birthDate: Date;
  cpf: string | undefined;
  gender: string | undefined;
  maritalStatus: string | undefined;
  ethnicity: string | undefined;
  placeOfBirth: string | undefined;
  occupation: string | undefined;
  phoneNumberRaw: string | undefined;
  phoneNumber: string;
  instagramAccount: string | undefined;
  email: string | undefined;
  cep: string | undefined;
  street: string | undefined;
  number: string | undefined;
  district: string | undefined;
  city: string | undefined;
  complement: string | undefined;
  state: string | undefined;
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
  creationDate: {
    type: Date,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
    index: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  cpf: {
    type: String,
  },
  gender: {
    type: String,
  },
  maritalStatus: {
    type: String,
  },
  ethnicity: {
    type: String,
  },
  placeOfBirth: {
    type: String,
  },
  occupation: {
    type: String,
  },
  phoneNumberRaw: {
    type: String,
    index: true,
  },
  phoneNumber: {
    type: String,
  },
  instagramAccount: {
    type: String,
  },
  email: {
    type: String,
  },
  cep: {
    type: String,
  },
  street: {
    type: String,
  },
  number: {
    type: String,
  },
  district: {
    type: String,
  },
  city: {
    type: String,
  },
  complement: {
    type: String,
  },
  state: {
    type: String,
  },
});

export const CustomersRepository = mongoose.model<Customer>(
  "Customers",
  CustomersSchema
);
