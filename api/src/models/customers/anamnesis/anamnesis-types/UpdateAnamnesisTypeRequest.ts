/** @format */
export class UpdateAnamnesisTypeRequest {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public template: string | null
  ) {}
}
