/** @format */

import RemindersHandlerExecutionStatus from "../constants/enums/ReminderExecutionHandlerStatus";
import ScheduledMessagesStatus from "../constants/enums/ScheduledMessagesStatus";
import { RemindersHandlerExecutionRepository } from "../db/models/RemindersHandlerExecutionsRepository";
import {
  ScheduledMessage,
  ScheduledMessagesRepository,
} from "../db/models/ScheduledMessagesRepository";
import { v4 as uuidv4 } from "uuid";
import { sendAppointmentReminderMessage } from "./whatsapp-service";
import { SendAppointmentReminderMessageRequest } from "../models/whatsapp/SendAppointmentReminderMessageRequest";
import { CustomersRepository } from "../db/models/CustomersRepository";
import { ServicesRepository } from "../db/models/ServicesRepository";
import { UpdateServiceRequest } from "../models/customers/services/UpdateServiceRequest";
import { CreateServiceRequest } from "../models/customers/services/CreateServiceRequest";
import { AccountRepository } from "../db/models/AccountRepository";
import Gender from "../constants/enums/Gender";

export const scheduleReminderMessage = async (
  customerId: string,
  serviceId: string,
  request: CreateServiceRequest | UpdateServiceRequest
): Promise<void> => {
  if (request.sendReminder) {
    const serviceDatetime = new Date(request.date);
    const now = new Date();
    const scheduledDateTime = new Date(
      serviceDatetime.getTime() -
        request.reminderMessageAdvanceTime * 60 * 60 * 1000
    );
    if (serviceDatetime.getTime() > now.getTime()) {
      const alreadyScheduledMessageDocument =
        await ScheduledMessagesRepository.findOne({
          serviceId: serviceId,
          customerId: customerId,
          $or: [
            { status: ScheduledMessagesStatus.Scheduled },
            { status: ScheduledMessagesStatus.Error },
          ],
        });
      if (!alreadyScheduledMessageDocument) {
        await ScheduledMessagesRepository.create({
          scheduledMessageId: uuidv4(),
          serviceId: serviceId,
          customerId: customerId,
          creationDate: now,
          scheduledDateTime: scheduledDateTime,
          status: ScheduledMessagesStatus.Scheduled,
        });
      } else {
        await ScheduledMessagesRepository.findOneAndUpdate(
          {
            scheduledMessageId:
              alreadyScheduledMessageDocument.scheduledMessageId,
            serviceId: serviceId,
            customerId: customerId,
          },
          {
            scheduledDateTime: scheduledDateTime,
            status: ScheduledMessagesStatus.Scheduled,
          }
        );
      }
    }
  } else {
    await ScheduledMessagesRepository.findOneAndRemove({
      serviceId: serviceId,
      customerId: customerId,
      $or: [
        { status: ScheduledMessagesStatus.Scheduled },
        { status: ScheduledMessagesStatus.Error },
      ],
    });
  }
};

export const processScheduledReminders = async (): Promise<void> => {
  const currentExecutionDocument =
    await RemindersHandlerExecutionRepository.create({
      remindersHandlerExecutionId: uuidv4(),
      startDatetime: new Date(),
      status: RemindersHandlerExecutionStatus.Running,
    });

  try {
    const lastExecutionDocument =
      await RemindersHandlerExecutionRepository.findOne({
        status: RemindersHandlerExecutionStatus.Completed,
      }).sort({ endDatetime: -1 });

    const scheduledRemindersDocuments = await ScheduledMessagesRepository.find({
      $or: [
        {
          status: ScheduledMessagesStatus.Scheduled,
          // scheduledDateTime: {
          //   $gte:
          //     lastExecutionDocument?.endDatetime?.toUTCString() ??
          //     new Date(-8640000000000000),
          // },
        },
        { status: ScheduledMessagesStatus.Error },
      ],
    });

    for (const scheduledReminder of scheduledRemindersDocuments) {
      await processScheduledMessage(scheduledReminder);
    }

    await RemindersHandlerExecutionRepository.findOneAndUpdate(
      {
        remindersHandlerExecutionId:
          currentExecutionDocument.remindersHandlerExecutionId,
      },
      {
        status: RemindersHandlerExecutionStatus.Completed,
        endDatetime: new Date(),
      }
    );
  } catch (e: any) {
    await RemindersHandlerExecutionRepository.findOneAndUpdate(
      {
        remindersHandlerExecutionId:
          currentExecutionDocument.remindersHandlerExecutionId,
      },
      {
        status: RemindersHandlerExecutionStatus.Error,
        endDatetime: new Date(),
        errorMessage: e.message,
        errorStackTrace: e.stackTrace,
      }
    );
  }
};

const processScheduledMessage = async (scheduledReminder: ScheduledMessage) => {
  const now = new Date();
  if (scheduledReminder.scheduledDateTime.getTime() > now.getTime()) {
    console.log(
      `${now.toISOString()} - Service time greather then now - ServiceId ${
        scheduledReminder.serviceId
      }`
    );
    return;
  } else {
    console.log(
      `${now.toISOString()} - Service time smaller then now - ServiceId ${
        scheduledReminder.serviceId
      }`
    );
  }

  const customerDocument = await CustomersRepository.findOne({
    customerId: scheduledReminder.customerId,
  });
  if (!customerDocument) {
    await ScheduledMessagesRepository.findOneAndUpdate(
      {
        scheduledMessageId: scheduledReminder.scheduledMessageId,
      },
      {
        status: ScheduledMessagesStatus.Error,
        errorMessage: `'Customer with id ${scheduledReminder.customerId}' not found`,
        errorDateTime: new Date(),
      }
    );
    return;
  }
  const serviceDocument = await ServicesRepository.findOne({
    serviceId: scheduledReminder.serviceId,
    customerId: scheduledReminder.customerId,
  });
  if (!serviceDocument) {
    await ScheduledMessagesRepository.findOneAndUpdate(
      {
        scheduledMessageId: scheduledReminder.scheduledMessageId,
      },
      {
        status: ScheduledMessagesStatus.Error,
        errorMessage: `'Service with id ${scheduledReminder.serviceId}' not found`,
        errorDateTime: new Date(),
      }
    );
    return;
  }

  let profissionalName: string = "";
  const profissionalDocument = await AccountRepository.findOne({
    email: serviceDocument.userId,
  });
  let referTerm = "";
  if (profissionalDocument.gender === Gender.Female) {
    referTerm = "Dra.";
  } else if (profissionalDocument.gender === Gender.Male) {
    referTerm = "Dr.";
  } else {
    referTerm = "";
  }
  if (profissionalDocument) {
    profissionalName = `${referTerm} ${profissionalDocument.username}`;
  }

  const dateTimeWhatsappApiWasInboked = new Date();
  const whatsappMessageReminderResponse = await sendAppointmentReminderMessage(
    new SendAppointmentReminderMessageRequest(
      scheduledReminder.serviceId,
      scheduledReminder.customerId,
      customerDocument!.phoneNumber!,
      customerDocument!.gender,
      customerDocument!.customerName,
      profissionalName,
      serviceDocument!.date.toLocaleDateString(),
      serviceDocument!.date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  );

  await ScheduledMessagesRepository.findOneAndUpdate(
    {
      scheduledMessageId: scheduledReminder.scheduledMessageId,
    },
    {
      status: whatsappMessageReminderResponse.status,
      sentDateTime:
        whatsappMessageReminderResponse.status === ScheduledMessagesStatus.Sent
          ? dateTimeWhatsappApiWasInboked
          : undefined,
      errorMessage: whatsappMessageReminderResponse.errorMessage
        ? whatsappMessageReminderResponse.errorMessage
        : undefined,
      errorDateTime:
        whatsappMessageReminderResponse.status === ScheduledMessagesStatus.Error
          ? dateTimeWhatsappApiWasInboked
          : undefined,
    }
  );
};
