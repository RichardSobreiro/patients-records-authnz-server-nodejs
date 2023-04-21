/** @format */

export class FacebookCallbackResponse {
  constructor(
    public username: string,
    public userId: string,
    public email: string,
    public bearerToken?: string
  ) {}
}
