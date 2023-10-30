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
        { status: ScheduledMessagesStatus.Scheduled },
        { status: ScheduledMessagesStatus.Error },
      ],
      scheduledDateTime: {
        $gte: lastExecutionDocument?.endDatetime ?? new Date(-8640000000000000),
      },
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
  const dateTimeWhatsappApiWasInboked = new Date();
  const whatsappMessageReminderResponse = await sendAppointmentReminderMessage(
    new SendAppointmentReminderMessageRequest(
      scheduledReminder.serviceId,
      scheduledReminder.customerId,
      customerDocument!.phoneNumber!,
      customerDocument!.gender,
      customerDocument!.customerName,
      "Ana Maria",
      serviceDocument!.date.toLocaleDateString(),
      serviceDocument!.date.toLocaleTimeString()
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

  await ServicesRepository.findOneAndUpdate(
    {
      serviceId: scheduledReminder.serviceId,
      customerId: scheduledReminder.customerId,
    },
    {
      status: whatsappMessageReminderResponse.status,
    }
  );
};
