/** @format */
export class CreateAnamnesisTypeResponse {
  constructor(
    public anamnesisTypeId: string,
    public creationDate: Date,
    public isDefault: boolean,
    public anamnesisTypeDescription: string,
    public template: string | null
  ) {}
}
