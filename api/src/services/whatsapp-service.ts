/** @format */
import { v4 as uuidv4 } from "uuid";
import { WhatsappNotificationRepository } from "../db/models/WhatsappNotificationRepository";
import { SendMessageRequest } from "../models/whatsapp/SendMessageRequest";
import { SendMessageResponse } from "../models/whatsapp/SendMessageResponse";
import { SendAppointmentReminderMessageRequest } from "../models/whatsapp/SendAppointmentReminderMessageRequest";
import { SendAppointmentReminderMessageResponse } from "../models/whatsapp/SendAppointmentReminderMessageResponse";
import { WhatsappMessageResponsesRepository } from "../db/models/WhatsappMessageResponsesRepository";
import ScheduledMessagesStatus from "../constants/enums/ScheduledMessagesStatus";

export const sendWelcomeMessage = async (request: SendMessageRequest) => {
  try {
    const customerPhoneNumber = request.customerPhoneNumber.replace(
      /[-\._\(\)\+]+/g,
      ""
    );
    const response = await fetch(
      `${process.env.FACEBOOK_GRAPH_API!}/${process.env
        .DEFAULT_PORTAL_ATENDER_PHONE_NUMBER_ID!}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_USER_ACCESS_TOKEN!}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: customerPhoneNumber,
          type: "template",
          template: {
            name: "boas_vindas",
            language: {
              code: "pt_BR",
            },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "text",
                    text: getGenderVariableWelcomeExpression(
                      request.customerGender
                    ),
                  },
                ],
              },
            ],
          },
        }),
      }
    );

    if (response.ok) {
    }
  } catch (error: any) {}
};

export const sendAppointmentReminderMessage = async (
  request: SendAppointmentReminderMessageRequest
): Promise<SendAppointmentReminderMessageResponse> => {
  const response = new SendAppointmentReminderMessageResponse(
    request.serviceId,
    request.customerId
  );
  try {
  } catch (e: any) {
    const customerPhoneNumber = request.customerPhoneNumber.replace(
      /[-\._\(\)\+]+/g,
      ""
    );
    const requestResponse = await fetch(
      `${process.env.FACEBOOK_GRAPH_API!}/${process.env
        .DEFAULT_PORTAL_ATENDER_PHONE_NUMBER_ID!}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_USER_ACCESS_TOKEN!}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: customerPhoneNumber,
          type: "template",
          template: {
            name: "lembrete_agendamento",
            language: {
              code: "pt_BR",
            },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "text",
                    text: request.customerName,
                  },
                ],
              },
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: request.professionalName,
                  },
                  {
                    type: "text",
                    text: request.serviceDate,
                  },
                  {
                    type: "text",
                    text: request.serviceTime,
                  },
                ],
              },
            ],
          },
        }),
      }
    );

    if (requestResponse.ok) {
      const whatsappResponse = await requestResponse.json();
      await WhatsappMessageResponsesRepository.create({
        customerId: request.customerId,
        serviceId: request.serviceId,
        creationDatetime: new Date(),
        input: whatsappResponse.contacts[0].input,
        wa_id: whatsappResponse.contacts[0].wa_id,
        whatsappMessageId: whatsappResponse.messages[0].id,
        whatsappMessageStatus: whatsappResponse.messages[0].message_status,
      });

      response.whatsappMessageId = whatsappResponse.messages[0].id;
      response.status =
        whatsappResponse.messages[0].message_status === "accepted"
          ? ScheduledMessagesStatus.Sent
          : ScheduledMessagesStatus.Suspended;
    } else {
      response.status = ScheduledMessagesStatus.Error;
      let requestResponseText: string | null = null;
      try {
        requestResponseText = await requestResponse.text();
      } catch (e: any) {
        requestResponseText = "Error parsing request response text";
      }
      response.errorMessage = `ERROR SENDING MESSAGE - HTTP Response Status: ${requestResponse.status} - HTTP Response Status Text: ${requestResponse.statusText} - HTTP Response Text: ${requestResponseText}`;
    }
  }
  return response;
};

export const processWebhookNotification = async (body: any) => {
  if (body.object === "whatsapp_business_account") {
    for (let i = 0; i < body.entry.length; i++) {
      for (let j = 0; j < body.entry[i].changes.length; j++) {
        if (body.entry[i].changes[j].field === "messages") {
          await processWhatsappMesssagesNotification(
            body,
            body.entry[i],
            body.entry[i].changes[j]
          );
        } else {
          throw new Error("not from the messages webhook");
        }
      }
    }
  } else {
    throw new Error("not from the messages webhook");
  }
};

const processWhatsappMesssagesNotification = async (
  body: any,
  entry: any,
  change: any
) => {
  try {
    for (const statusObject of change.value.statuses) {
      const phonenumber = change.value.metadata.display_phone_number;
      const whatsappNotificationId = entry.id;
      const wamid = statusObject.id;
      const whatsappStatus = statusObject.status;
      const timestamp = statusObject.timestamp;

      const documentExists = await WhatsappNotificationRepository.exists({
        wamid: wamid,
        whatsappStatus: whatsappStatus,
        timestamp: timestamp,
      });

      if (documentExists === null) {
        await WhatsappNotificationRepository.insertMany({
          notificationId: uuidv4(),
          whatsappNotificationId: whatsappNotificationId,
          wamid: wamid,
          whatsappStatus: whatsappStatus,
          timestamp: timestamp,
          creationDate: new Date(),
          type: "messages",
          phoneNumber: phonenumber,
          body: JSON.stringify(body),
        });
      } else {
        console.log(
          `DOCUMENT EXISTS: ${documentExists} - wamid: ${wamid} - whatsappStatus: ${whatsappStatus} - timestamp: ${timestamp}`
        );
      }
    }
  } catch (e: any) {
    console.log(`EXCEPTION ${e.name}: ${e.message}`);
    console.log(`EXCEPTION STACK TRACE: ${e.stack}`);
  }
};

const getGenderVariableWelcomeExpression = (
  gender: string | undefined
): string => {
  if (gender && gender !== "") {
    if (gender === "male") {
      return "vindo";
    } else if (gender === "female") {
      return "vinda";
    } else {
      return "vinda(o)";
    }
  } else {
    return "vinda(o)";
  }
};
