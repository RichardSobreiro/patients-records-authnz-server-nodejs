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

export class CreateSectionItem {
  constructor(public sectionId: string, public sectionTitle: string) {}
}

export class CreateAnamnesisTypeResponse {
  constructor(
    public anamnesisTypeId: string,
    public creationDate: Date,
    public isDefault: boolean,
    public anamnesisTypeDescription: string,
    public template: string | null,
    public questions: CreateQuestionItem[] | undefined,
    public sections: CreateSectionItem[] | undefined
  ) {}
}
