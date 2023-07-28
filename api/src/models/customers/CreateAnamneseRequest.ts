/** @format */

export class CreateAnamnesisTypeContentRequest {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public isDefault: boolean,
    public content?: string | null
  ) {}
}

export class CreateAnamneseRequest {
  constructor(
    public customerId: string,
    public date: Date,
    public anamnesisTypesContent: CreateAnamnesisTypeContentRequest[],
    public birthDate: Date,
    public freeTypeText?: string,
    public gender?: string,
    public ethnicity?: string,
    public maritalStatus?: string,
    public employmentStatus?: string,
    public comments?: string
  ) {}
}
