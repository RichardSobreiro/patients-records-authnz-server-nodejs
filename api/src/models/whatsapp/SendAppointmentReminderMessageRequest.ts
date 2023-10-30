/** @format */

export class SendAppointmentReminderMessageRequest {
  constructor(
    public serviceId: string,
    public customerId: string,
    public customerPhoneNumber: string,
    public customerGender: string | undefined,
    public customerName,
    public professionalName: string,
    public serviceDate: string,
    public serviceTime: string
  ) {}
}
