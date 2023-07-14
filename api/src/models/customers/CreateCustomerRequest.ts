/** @format */

import { CreateAnamneseRequest } from "./CreateAnamneseRequest";

export class CreateCustomerRequest {
  constructor(
    public customerName: string,
    public phoneNumber: string,
    public anamnese: CreateAnamneseRequest,
    public email?: string
  ) {}
}
