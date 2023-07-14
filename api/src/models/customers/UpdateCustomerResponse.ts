/** @format */

export class UpdateCustomerResponse {
  constructor(
    public userId: string,
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public birthDate: Date,
    public creationDate: Date,
    public email?: string
  ) {}
}
