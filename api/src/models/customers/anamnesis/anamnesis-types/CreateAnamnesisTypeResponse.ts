/** @format */
export class CreateQuestionItem {
  constructor(
    public questionItemId: string,
    public questionType: string,
    public questionPhrase: string,
    public questionAnswersOptions: string[] | undefined,
    public questionValue: string | undefined
  ) {}
}

export class CreateAnamnesisTypeResponse {
  constructor(
    public anamnesisTypeId: string,
    public creationDate: Date,
    public isDefault: boolean,
    public anamnesisTypeDescription: string,
    public template: string | null,
    public questions: CreateQuestionItem[] | undefined
  ) {}
}
