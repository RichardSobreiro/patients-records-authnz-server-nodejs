/** @format */
export class UpdateAnamnesisTypeResponse {
  constructor(
    public anamnesisTypeId: string,
    public isDefault: boolean,
    public anamnesisTypeDescription: string,
    public template: string | null
  ) {}
}
