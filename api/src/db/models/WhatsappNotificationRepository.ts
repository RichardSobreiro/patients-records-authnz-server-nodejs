/** @format */

import mongoose, { Schema } from "mongoose";

export interface WhatsappNotificationsType {
  notificationId: string;
  whatsappNotificationId: string;
  wamid: string | undefined;
  whatsappStatus: string | undefined;
  timestamp: string | undefined;
  creationDate: Date;
  type: string | undefined;
  phoneNumber: string | undefined;
  body: string;
}

const WhatsappNotificationsSchema = new Schema({
  notificationId: {
    type: String,
    required: true,
    index: true,
  },
  whatsappNotificationId: {
    type: String,
    required: true,
    index: true,
  },
  wamid: {
    type: String,
    required: false,
    index: true,
  },
  whatsappStatus: {
    type: String,
    required: false,
    index: true,
  },
  timestamp: {
    type: String,
    required: false,
    index: true,
  },
  creationDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  body: {
    type: String,
    required: true,
  },
});

export const WhatsappNotificationRepository =
  mongoose.model<WhatsappNotificationsType>(
    "WhatsappNotifications",
    WhatsappNotificationsSchema
  );
