/** @format */

import mongoose, { Schema } from "mongoose";

interface Service {
  serviceId: string;
  customerId: string;
  userId: string;
  creationDate: Date;
  date: Date;
  durationHours: number;
  durationMinutes: number;
  serviceTypeIds: string[];
  status: string;
  sendReminder: boolean;
  reminderMessageAdvanceTime: number;
  beforeNotes: string;
  afterNotes: string;
}

const ServicesSchema = new Schema({
  serviceId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customerId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  durationHours: {
    type: Number,
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
  },
  serviceTypeIds: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  sendReminder: {
    type: Boolean,
    required: true,
  },
  reminderMessageAdvanceTime: {
    type: Number,
    required: true,
  },
  beforeNotes: {
    type: String,
  },
  afterNotes: {
    type: String,
  },
});

export const ServicesRepository = mongoose.model<Service>(
  "Services",
  ServicesSchema
);
