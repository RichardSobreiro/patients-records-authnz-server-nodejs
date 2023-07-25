/** @format */

export class UpdateAnamnesisRequest {
  constructor(
    public anamneseId: string,
    public customerId: string,
    public date: Date,
    public type: string[],
    public freeTypeText?: string,
    public gender?: string,
    public ethnicity?: string,
    public maritalStatus?: string,
    public employmentStatus?: string,
    public comments?: string
  ) {}
}
