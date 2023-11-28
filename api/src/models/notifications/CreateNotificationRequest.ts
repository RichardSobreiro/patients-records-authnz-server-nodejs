/** @format */

import NotificationTypes from "../../constants/NotificationTypes";

class CreateNotificationRequest {
  constructor(
    public title: string,
    public shortDescription: string,
    public type: NotificationTypes,
    public longDescription?: string
  ) {}
}

export default CreateNotificationRequest;
