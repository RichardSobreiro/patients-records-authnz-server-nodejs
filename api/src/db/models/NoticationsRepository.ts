/** @format */

import mongoose, { Schema } from "mongoose";
import NotificationTypes from "../../constants/NotificationTypes";

const NotificationsSchema = new Schema({
  notificationId: {
    type: String,
    unique: true,
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
  title: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  type: {
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  read: {
    type: Boolean,
    required: true,
  },
  readDate: {
    type: Date,
    required: false,
  },
  longDescription: {
    type: String,
    required: false,
  },
});

export interface Notifications {
  notificationId: string;
  userId: string;
  creationDate: Date;
  title: string;
  shortDescription: string;
  type: NotificationTypes;
  read: boolean;
  readDate?: Date;
  longDescription?: string;
}

export const NotificationsRepository = mongoose.model<Notifications>(
  "Notifications",
  NotificationsSchema
);
