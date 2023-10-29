/** @format */

import mongoose, { Schema } from "mongoose";

interface ScheduledMessage {
  serviceId: string;
  customerId: string;
  creationDate: Date;
  scheduledDateTime: Date;
  status: "Scheduled" | "Sent" | "Suspended" | "Canceled" | "Error";
  sentDateTime: Date | null;
  errorMessage: string | null;
  errorDateTime: Date | null;
}

const ScheduledMessagesSchema = new Schema({
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
  creationDate: {
    type: Date,
    required: true,
  },
  scheduledDateTime: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    required: true,
    index: true,
  },
  sentDateTime: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
  errorDateTime: {
    type: Date,
  },
});

export const ScheduledMessagesRepository = mongoose.model<ScheduledMessage>(
  "ScheduledMessages",
  ScheduledMessagesSchema
);
