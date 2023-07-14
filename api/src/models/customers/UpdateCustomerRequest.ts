/** @format */

export class UpdateCustomerRequest {
  constructor(
    public userId: string,
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public email?: string
  ) {}
}
