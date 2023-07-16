/** @format */

export class GetAnamnesisByIdResponse {
  constructor(
    public anamneseId: string,
    public customerId: string,
    public creationDate: Date,
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
