/** @format */

import NotificationTypes from "../../constants/NotificationTypes";

export class GetNotificationByIdResponse {
  constructor(
    public notificationId: string,
    public userId: string,
    public creationDate: Date,
    public title: string,
    public shortDescription: string,
    public type: NotificationTypes,
    public read: boolean,
    public readDate?: Date,
    public longDescription?: string
  ) {}
}

export default GetNotificationByIdResponse;
