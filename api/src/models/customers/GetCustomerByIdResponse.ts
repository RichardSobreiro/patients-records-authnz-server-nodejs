/** @format */

export class GetCustomerByIdResponse {
  constructor(
    public userId: string,
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public creationDate: Date,
    public email?: string,
    public mostRecentProceedingId?: string,
    public mostRecentProceedingDate?: Date,
    public mostRecentProceedingAfterPhotoUrl?: string
  ) {}
}
