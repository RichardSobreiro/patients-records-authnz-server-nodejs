/** @format */

export class CreateQuestionAnswerRequest {
  constructor(
    public questionItemId: string,
    public questionType: string,
    public questionPhrase: string,
    public questionAnswersOptions: string[] | undefined,
    public questionValue: string | undefined,
    public sectionId?: string
  ) {}
}

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

export class CreateSectionItem {
  constructor(public sectionId: string, public sectionTitle: string) {}
}

export class CreateAnamnesisTypeContentResponse {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public isDefault: boolean,
    public content?: string | null,
    public files?: CreateAnamnesisTypeFileRequest[] | null,
    public questions?: CreateQuestionAnswerRequest[] | undefined,
    public sections?: CreateSectionItem[] | undefined
  ) {}
}

export class CreateAnamneseResponse {
  constructor(
    public anamneseId: string,
    public customerId: string,
    public creationDate: Date,
    public date: Date,
    public anamnesisTypesContent: CreateAnamnesisTypeContentResponse[]
  ) {}
}
