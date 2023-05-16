/** @format */

export class UpdateProceedingRequest {
  constructor(
    public date: Date,
    public proceedingTypeDescription: string,
    public notes: string,
    public beforePhotos?: any,
    public afterPhotos?: any
  ) {}
}
