/** @format */
export class UpdateQuestionItem {
  constructor(
    public questionItemId: string,
    public questionType: string,
    public questionPhrase: string,
    public questionAnswersOptions: string[] | undefined,
    public questionValue: string | undefined
  ) {}
}

export class UpdateSectionItem {
  constructor(public sectionId: string, public sectionTitle: string) {}
}

export class UpdateAnamnesisTypeRequest {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public template: string | null,
    public questions: UpdateQuestionItem[] | undefined,
    public sections: UpdateSectionItem[] | undefined
  ) {}
}
