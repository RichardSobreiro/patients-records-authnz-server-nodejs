/** @format */
import { v4 as uuidv4 } from "uuid";
import { WhatsappNotificationRepository } from "../db/models/WhatsappNotificationRepository";
import { CustomersRepository } from "../db/models/CustomersRepository";
import { SendMessageRequest } from "../models/whatsapp/SendMessageRequest";

export const sendWelcomeMessage = async (
  sendMessageRequest: SendMessageRequest
) => {
  try {
    const customerDocument = await CustomersRepository.find({
      customerId: sendMessageRequest.customerId,
    });

    if (customerDocument !== null && customerDocument.length === 0) {
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
            to: customerDocument[0].phoneNumberRaw,
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
                        customerDocument[0].gender
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
    }
  } catch (error: any) {}
};

export const sendAppointmentReminderMessage = async (
  sendMessageRequest: SendMessageRequest
) => {
  const customerDocument = await CustomersRepository.find({
    customerId: sendMessageRequest.customerId,
  });

  if (customerDocument !== null && customerDocument.length > 0) {
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
          to: customerDocument[0].phoneNumberRaw,
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
                      customerDocument[0].gender
                    ),
                  },
                ],
              },
            ],
          },
        }),
      }
    );
  }
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
