/** @format */

import { NotificationsRepository } from "../db/models/NoticationsRepository";
import CreateNotificationRequest from "../models/notifications/CreateNotificationRequest";
import CreateNotificationResponse from "../models/notifications/CreateNotificationResponse";
import GetNotificationsResponse, {
  GetNotificationResponse,
} from "../models/notifications/GetNotificationsResponse";
import { v4 as uuidv4 } from "uuid";
import UpdateNotificationRequest from "../models/notifications/UpdateNotificationRequest";
import UpdateNotificationResponse from "../models/notifications/UpdateNotificationResponse";
import GetNotificationByIdResponse from "../models/notifications/GetNotificationByIdResponse";

export const createUserNotification = async (
  userId: string,
  request: CreateNotificationRequest
): Promise<CreateNotificationResponse> => {
  const createNotificationDoc = await NotificationsRepository.create({
    notificationId: uuidv4(),
    userId: userId,
    creationDate: new Date(),
    title: request.title,
    shortDescription: request.shortDescription,
    type: {
      key: request.type.key,
      value: request.type.value,
    },
    read: false,
    longDescription: request.longDescription,
  });

  return new CreateNotificationResponse(
    createNotificationDoc.notificationId,
    createNotificationDoc.userId,
    createNotificationDoc.creationDate,
    createNotificationDoc.title,
    createNotificationDoc.shortDescription,
    createNotificationDoc.type,
    createNotificationDoc.read,
    createNotificationDoc.readDate,
    createNotificationDoc.longDescription
  );
};

export const getUserNotifications = async (
  userId: string,
  pageNumberParam: string,
  limitParam?: string
): Promise<GetNotificationsResponse> => {
  const pageNumber = parseInt(pageNumberParam) - 1 || 0;
  const limit = (limitParam && parseInt(limitParam)) || 12;

  const filter: any = {};
  filter.userId = userId;

  const startIndex = pageNumber * limit;
  const endIndex = (pageNumber + 1) * limit;

  const notificationsDocs = await NotificationsRepository.find(filter)
    .sort({ creationDate: "desc" })
    .skip(startIndex)
    .limit(limit)
    .exec();

  const notificationsCount = await NotificationsRepository.countDocuments(
    filter
  ).exec();

  const unReadNotificationsCount = await NotificationsRepository.countDocuments(
    { userId: userId, read: false }
  ).exec();

  const getNotificationsResponse = new GetNotificationsResponse(
    notificationsCount,
    unReadNotificationsCount
  );

  if (startIndex > 0) {
    getNotificationsResponse.previous = {
      pageNumber: pageNumber - 1,
      limit: limit,
    };
  }
  if (endIndex < notificationsCount) {
    getNotificationsResponse.next = {
      pageNumber: pageNumber + 1,
      limit: limit,
    };
  }

  getNotificationsResponse.notifications = notificationsDocs?.map(
    (doc) =>
      new GetNotificationResponse(
        doc.notificationId,
        doc.userId,
        doc.creationDate,
        doc.title,
        doc.shortDescription,
        { key: doc.type.toString(), value: doc.type.value },
        doc.read,
        doc.readDate,
        doc.longDescription
      )
  );

  return getNotificationsResponse;
};

export const getUserNotificationById = async (
  userId: string,
  notificationId: string
): Promise<GetNotificationByIdResponse> => {
  const doc = await NotificationsRepository.findOne({
    userId: userId,
    notificationId: notificationId,
  });

  if (!doc) {
    throw new Error("404");
  }

  return new GetNotificationByIdResponse(
    doc.notificationId,
    doc.userId,
    doc.creationDate,
    doc.title,
    doc.shortDescription,
    { key: doc.type.toString(), value: doc.type.value },
    doc.read,
    doc.readDate,
    doc.longDescription
  );
};

export const updateUserNotification = async (
  userId: string,
  request: UpdateNotificationRequest
): Promise<UpdateNotificationResponse> => {
  const updatedNotificationDoc = await NotificationsRepository.findOneAndUpdate(
    {
      userId: userId,
      notificationId: request.notificationId,
    },
    {
      $set: {
        read: request.read,
        readDate: request.readDate,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedNotificationDoc) {
    throw new Error("404");
  }

  return new UpdateNotificationResponse(
    updatedNotificationDoc.notificationId,
    updatedNotificationDoc.userId,
    updatedNotificationDoc.creationDate,
    updatedNotificationDoc.title,
    updatedNotificationDoc.shortDescription,
    updatedNotificationDoc.type,
    updatedNotificationDoc.read,
    updatedNotificationDoc.readDate,
    updatedNotificationDoc.longDescription
  );
};
