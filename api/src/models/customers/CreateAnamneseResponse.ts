/** @format */

export class CreateAnamneseResponse {
  constructor(
    public anamneseId: string,
    public customerId: string,
    public creationDate: Date,
    public birthDate: Date,
    public gender?: string,
    public ethnicity?: string,
    public maritalStatus?: string,
    public employmentStatus?: string,
    public comments?: string
  ) {}
}
