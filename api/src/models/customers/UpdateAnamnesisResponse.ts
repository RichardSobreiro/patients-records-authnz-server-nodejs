/** @format */

export class UpdateAnamnesisTypeFileResponse {
  constructor(
    public fileId: string,
    public creationDate: Date,
    public mimeType: string,
    public fileType: string,
    public contentEncoding: string,
    public filename: string,
    public originalName: string,
    public baseUrl: string,
    public sasToken: string,
    public sasTokenExpiresOn: Date | undefined
  ) {}
}

export class UpdateAnamnesisTypeContentResponse {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public isDefault: boolean,
    public content?: string | null,
    public files?: UpdateAnamnesisTypeFileResponse[] | null
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
