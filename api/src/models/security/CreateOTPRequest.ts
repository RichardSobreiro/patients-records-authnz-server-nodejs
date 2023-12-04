/** @format */

import OTPType from "../../constants/OTPType";

class CreateOTPRequest {
  constructor(public userId, public otpType: OTPType) {}
}

export default CreateOTPRequest;
