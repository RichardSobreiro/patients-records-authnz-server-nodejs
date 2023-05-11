/** @format */
export class GetProceedingTypeResponse {
  constructor(
    public proceedingTypeId: string,
    public proceedingTypeDescription: string,
    public notes: string | null
  ) {}
}

export class GetProceedingTypesResponse {
  constructor(
    public username: string,
    public proceedingsTypes?: GetProceedingTypeResponse[] | null
  ) {}
}
