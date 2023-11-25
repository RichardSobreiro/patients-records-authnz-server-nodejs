/** @format */

import PaymentInstalmentsStatus from "../../../enums/PaymentInstalmentsStatus";
import { GetUserPaymentMethodResponse } from "./GetPaymentUserMethodResponse";

class GetPaymentInstalmentResponse {
  constructor(
    public paymentInstalmentsId: string,
    public paymentUserMethodId: string,
    public userId: string,
    public creationDate: Date,
    public instalmentNumber: string,
    public status: PaymentInstalmentsStatus,
    public statusDescription: string,
    public expireDate?: Date,
    public paymentMethod?: GetUserPaymentMethodResponse
  ) {}
}

export default GetPaymentInstalmentResponse;
