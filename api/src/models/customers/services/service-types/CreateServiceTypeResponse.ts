/** @format */
export class CreateServiceTypeResponse {
  constructor(
    public serviceTypeId: string,
    public creationDate: Date,
    public isDefault: boolean,
    public serviceTypeDescription: string,
    public notes: string | null
  ) {}
}
