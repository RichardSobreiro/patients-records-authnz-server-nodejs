/** @format */

export class CreateAnamneseRequest {
  constructor(
    public customerId: string,
    public date: Date,
    public type: string[],
    public birthDate: Date,
    public freeTypeText?: string,
    public gender?: string,
    public ethnicity?: string,
    public maritalStatus?: string,
    public employmentStatus?: string,
    public comments?: string
  ) {}
}
