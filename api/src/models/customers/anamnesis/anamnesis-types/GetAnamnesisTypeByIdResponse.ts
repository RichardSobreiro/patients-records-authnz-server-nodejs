/** @format */
export class GetQuestionItem {
  constructor(
    public questionItemId: string,
    public questionType: string,
    public questionPhrase: string,
    public questionAnswersOptions: string[] | undefined,
    public questionValue: string | undefined
  ) {}
}

export class GetAnamnesisTypeByIdResponse {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public template: string | null,
    public isDefault: boolean,
    public questions: GetQuestionItem[] | undefined
  ) {}
}
