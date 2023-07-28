/** @format */

export class UpdateAnamnesisTypeContentResponse {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public isDefault: boolean,
    public content?: string | null
  ) {}
}

export class UpdateAnamnesisResponse {
  constructor(
    public anamneseId: string,
    public customerId: string,
    public date: Date,
    public anamnesisTypesContent: UpdateAnamnesisTypeContentResponse[],
    public freeTypeText?: string,
    public gender?: string,
    public ethnicity?: string,
    public maritalStatus?: string,
    public employmentStatus?: string,
    public comments?: string
  ) {}
}
