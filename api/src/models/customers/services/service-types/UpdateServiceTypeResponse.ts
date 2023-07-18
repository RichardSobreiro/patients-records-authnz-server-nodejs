/** @format */
export class UpdateServiceTypeResponse {
  constructor(
    public serviceTypeId: string,
    public isDefault: boolean,
    public serviceTypeDescription: string,
    public notes: string | null
  ) {}
}
