/** @format */
class UpdateNotificationRequest {
  constructor(
    public notificationId: string,
    public read: boolean,
    public readDate?: Date
  ) {}
}

export default UpdateNotificationRequest;
