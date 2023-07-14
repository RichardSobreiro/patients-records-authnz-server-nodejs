/** @format */

import { CreateAnamneseResponse } from "./CreateAnamneseResponse";

export class CreateCustomerResponse {
  constructor(
    public customerId: string,
    public customerName: string,
    public phoneNumber: string,
    public creationDate: Date,
    public anamnese: CreateAnamneseResponse,
    public email?: string
  ) {}
}
