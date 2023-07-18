/** @format */
export class GetServiceTypeResponse {
  constructor(
    public serviceTypeId: string,
    public serviceTypeDescription: string,
    public notes: string | null,
    public isDefault: boolean
  ) {}
}

export class GetServiceTypesResponse {
  constructor(
    public userId: string,
    public serviceTypes?: GetServiceTypeResponse[] | null
  ) {}
}
