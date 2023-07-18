/** @format */
export class UpdateServiceTypeRequest {
  constructor(
    public serviceTypeId: string,
    public serviceTypeDescription: string,
    public notes: string | null
  ) {}
}
