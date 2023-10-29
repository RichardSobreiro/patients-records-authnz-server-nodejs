/** @format */

import mongoose, { Schema } from "mongoose";

interface RemindersHandlerExecution {
  remindersHandlerExecutionId: string;
  startDatetime: Date;
  status: "Running" | "Completed" | "Canceled" | "Error";
  endDatetime: Date | null;
  errorMessage: string | null;
  errorStackTrace: string | null;
}

const RemindersHandlerExecutionsSchema = new Schema({
  remindersHandlerExecutionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  startDatetime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    index: true,
  },
  endDatetime: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
  errorStackTrace: {
    type: String,
  },
});

export const RemindersHandlerExecutionRepository =
  mongoose.model<RemindersHandlerExecution>(
    "RemindersHandlerExecutions",
    RemindersHandlerExecutionsSchema
  );
