/** @format */

export class PaymentProcessingResponse {
  constructor(
    public paymentStatus: boolean,
    public message: string,
    public bankSlipBarcode?: string,
    public bankSlipUrl?: string,
    public bankSlipDueDate?: Date
  ) {}
}
