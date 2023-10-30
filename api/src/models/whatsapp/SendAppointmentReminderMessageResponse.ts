/** @format */

import ScheduledMessagesStatus from "../../constants/enums/ScheduledMessagesStatus";

export class SendAppointmentReminderMessageResponse {
  constructor(
    public serviceId: string,
    public customerId: string,
    public whatsappMessageId?: string,
    public status?: ScheduledMessagesStatus,
    public errorMessage?: string
  ) {}
}
