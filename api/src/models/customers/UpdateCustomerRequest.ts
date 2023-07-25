/** @format */

export class UpdateCustomerRequest {
  constructor(
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public email?: string
  ) {}
}
