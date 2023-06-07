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
  mostRecentProceedingId?: string;
  mostRecentProceedingDate?: Date;
  mostRecentProceedingAfterPhotoUrl?: string;
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

export const Patients = mongoose.model<Patient>("Patients", PatientsSchema);
