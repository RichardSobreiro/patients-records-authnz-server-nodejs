/** @format */

import mongoose, { Schema } from "mongoose";

interface Patient {
  userId: string;
  patientId: string;
  patientName: string;
  phoneNumber: string;
  birthDate: Date;
  creationDate: Date;
  email?: string;
}

const PatientsSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  patientId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  patientName: {
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
});

export const Patients = mongoose.model<Patient>("Patients", PatientsSchema);
