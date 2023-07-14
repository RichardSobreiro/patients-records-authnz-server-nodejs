/** @format */

export class CreateAnamneseRequest {
  constructor(
    public birthDate: Date,
    public gender?: string,
    public ethnicity?: string,
    public maritalStatus?: string,
    public employmentStatus?: string,
    public comments?: string
  ) {}
}
