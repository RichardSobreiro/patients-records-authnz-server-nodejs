/** @format */

import PaymentInstalmentsStatus from "../../../enums/PaymentInstalmentsStatus";

export class CreatePaymentResponse {
  constructor(
    public paymentInstalmentsId: string,
    public paymentsUserMethodId: string,
    public userId: string,
    public creationDate: Date,
    public instalmentNumber: string,
    public status: PaymentInstalmentsStatus,
    public statusDescription: string,
    public expireDate?: Date
  ) {}
}

export default CreatePaymentResponse;
