/** @format */

export class CreateProceedingRequest {
  constructor(
    public date: Date,
    public proceedingTypeDescription: string,
    public notes: string,
    public beforePhotos?: any,
    public afterPhotos?: any
  ) {}
}
