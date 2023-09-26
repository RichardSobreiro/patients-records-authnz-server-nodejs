/** @format */

export class UpdateQuestionAnswerRequest {
  constructor(
    public questionItemId: string,
    public questionType: string,
    public questionPhrase: string,
    public questionAnswersOptions: string[] | undefined,
    public questionValue: string | undefined
  ) {}
}

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

export class UpdateSectionItem {
  constructor(public sectionId: string, public sectionTitle: string) {}
}

export class UpdateAnamnesisTypeContentResponse {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public isDefault: boolean,
    public content?: string | null,
    public files?: UpdateAnamnesisTypeFileResponse[] | null,
    public questions?: UpdateQuestionAnswerRequest[] | undefined,
    public sections?: UpdateSectionItem[] | undefined
  ) {}
}

export class UpdateAnamnesisResponse {
  constructor(
    public anamneseId: string,
    public customerId: string,
    public date: Date,
    public anamnesisTypesContent: UpdateAnamnesisTypeContentResponse[]
  ) {}
}
