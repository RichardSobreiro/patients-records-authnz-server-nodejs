/** @format */

export class CreateUserRequest {
  constructor(
    public email: string,
    public username: string,
    public password?: string,
    public userCompanyName?: string,
    public userPlanId?: string
  ) {}
}
