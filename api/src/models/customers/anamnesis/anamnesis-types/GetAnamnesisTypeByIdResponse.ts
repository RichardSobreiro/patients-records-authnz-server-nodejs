/** @format */
export class GetAnamnesisTypeByIdResponse {
  constructor(
    public anamnesisTypeId: string,
    public anamnesisTypeDescription: string,
    public template: string | null,
    public isDefault: boolean
  ) {}
}
