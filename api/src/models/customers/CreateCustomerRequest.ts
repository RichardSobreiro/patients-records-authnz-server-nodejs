/** @format */

export class CreateCustomerRequest {
  constructor(
    public customerName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public email?: string
  ) {}
}
