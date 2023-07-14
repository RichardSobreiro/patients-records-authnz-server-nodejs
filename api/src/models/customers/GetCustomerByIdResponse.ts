/** @format */

import { GetAnamneseByIdResponse } from "./GetAnamneseByIdResponse";

export class GetCustomerByIdResponse {
  constructor(
    public userId: string,
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public creationDate: Date,
    public anamneses?: GetAnamneseByIdResponse[],
    public email?: string,
    public mostRecentProceedingId?: string,
    public mostRecentProceedingDate?: Date,
    public mostRecentProceedingAfterPhotoUrl?: string
  ) {}
}
