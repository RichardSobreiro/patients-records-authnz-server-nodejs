/** @format */

export class GetServiceTypeAgendaResponse {
  constructor(
    public serviceTypeId: string,
    public serviceTypeDescription: string,
    public notes: string | null,
    public isDefault: boolean
  ) {}
}

export class GetServiceAgendaResponse {
  constructor(
    public serviceId: string,
    public customerId: string,
    public customerName: string,
    public customerPhoneNumber: string,
    public date: Date,
    public serviceTypes: GetServiceTypeAgendaResponse[],
    public durationHours: number,
    public durationMinutes: number,
    public status: string,
    public sendReminder: boolean,
    public reminderMessageAdvanceTime: number
  ) {}
}

export class GetServicesAgendaResponse {
  constructor(
    public servicesCount: number,
    public servicesList?: GetServiceAgendaResponse[] | null
  ) {}
}
