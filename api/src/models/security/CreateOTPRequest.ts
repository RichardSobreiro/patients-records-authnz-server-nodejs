/** @format */

import OTPType from "../../constants/OTPType";

class CreateOTPRequest {
  constructor(public userId: string, public otpType: OTPType) {}
}

export default CreateOTPRequest;
