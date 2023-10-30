/** @format */

import mongoose, { Schema } from "mongoose";

export interface WhatsappMessageResponse {
  customerId: string;
  serviceId: string;
  creationDatetime: Date;
  input: string | undefined; // Phone number sent
  wa_id: string | undefined; // Phone number which was actually mapped by whatsapp to an existing contact
  whatsappMessageId: string | undefined;
  whatsappMessageStatus: string | undefined;
}

const WhatsappMessageResponsesSchema = new Schema({
  customerId: {
    type: String,
    required: true,
    index: true,
  },
  serviceId: {
    type: String,
    required: true,
    index: true,
  },
  creationDatetime: {
    type: Date,
    required: true,
  },
  input: {
    type: String,
    required: false,
    index: true,
  },
  wa_id: {
    type: String,
    required: false,
    index: true,
  },
  whatsappMessageId: {
    type: String,
    required: false,
    index: true,
  },
  whatsappMessageStatus: {
    type: String,
    required: false,
    index: true,
  },
});

export const WhatsappMessageResponsesRepository =
  mongoose.model<WhatsappMessageResponse>(
    "WhatsappMessageResponses",
    WhatsappMessageResponsesSchema
  );
