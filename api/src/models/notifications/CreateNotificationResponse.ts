/** @format */

import NotificationTypes from "../../constants/NotificationTypes";

class CreateNotificationResponse {
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

export default CreateNotificationResponse;
