/** @format */

export class CreateUserResponse {
  constructor(
    public email: string,
    public username: string,
    public userCreationCompleted: boolean,
    public userPlanId?: string,
    public paymentStatus?: {
      paymentOk: boolean;
      paymentIssueMessage?: string;
    },
    public userCompanyName?: string
  ) {}
}
