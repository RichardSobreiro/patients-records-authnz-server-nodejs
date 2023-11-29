/** @format */

import NotificationTypes from "../../constants/NotificationTypes";

export class GetNotificationResponse {
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

class ListPage {
  constructor(public pageNumber: number, public limit: number) {}
}

class GetNotificationsResponse {
  constructor(
    public notificationsCount: number,
    public unReadNotificationsCount: number,
    public previous?: ListPage,
    public next?: ListPage,
    public notifications?: GetNotificationResponse[]
  ) {}
}

export default GetNotificationsResponse;
