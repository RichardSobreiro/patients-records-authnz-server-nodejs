/** @format */

export class UpdateCustomerResponse {
  constructor(
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public creationDate: Date,
    public email?: string
  ) {}
}
