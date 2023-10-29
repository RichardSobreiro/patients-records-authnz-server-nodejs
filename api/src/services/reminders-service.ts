/** @format */

import RemindersHandlerExecutionStatus from "../constants/enums/ReminderExecutionHandlerStatus";
import ScheduledMessagesStatus from "../constants/enums/ScheduledMessagesStatus";
import { RemindersHandlerExecutionRepository } from "../db/models/RemindersHandlerExecutionsRepository";
import { ScheduledMessagesRepository } from "../db/models/ScheduledMessagesRepository";
import { v4 as uuidv4 } from "uuid";

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
    }
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
