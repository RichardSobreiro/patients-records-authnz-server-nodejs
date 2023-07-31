/** @format */

export class CreateAnamnesisTypeFileRequest {
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

export class CreateAnamnesisTypeContentRequest {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public isDefault: boolean,
    public content?: string | null,
    public files?: CreateAnamnesisTypeFileRequest[] | null
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
