/** @format */

import OTPType from "../../constants/OTPType";

class CreateOTPResponse {
  constructor(public userId, public otp: string, public otpType: OTPType) {}
}

export default CreateOTPResponse;
