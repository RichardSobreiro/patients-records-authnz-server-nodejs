/** @format */

import otpGenerator from "otp-generator";
import { OTPRepository } from "../../db/models/OTPRepository";
import CreateOTPRequest from "../../models/security/CreateOTPRequest";
import CreateOTPResponse from "../../models/security/CreateOTPResponse";
import UpdateOTPRequest from "../../models/security/UpdateOTPRequest";
import UpdateOTPResponse from "../../models/security/UpdateOTPResponse";
import ErrorReponse from "../../models/errors/ErrorResponse";
import OTPType from "../../constants/OTPType";
import { AccountRepository } from "../../db/models/AccountRepository";
import {
  sendValidationEmail,
  sendWelcomeValidationEmail,
} from "../email/email-service";

export const createOTP = async (
  request: CreateOTPRequest
): Promise<CreateOTPResponse | ErrorReponse> => {
  const accountDocument = await AccountRepository.findOne({
    userId: request.userId,
  });
  if (!accountDocument) {
    return new ErrorReponse("Conta não existe", 422);
  }

  if (
    request.otpType !== OTPType.VALIDATE_EMAIL &&
    request.otpType !== OTPType.ACCOUNT_CREATED
  ) {
    return new ErrorReponse("Tipo desconhecido", 422);
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });

  const now = new Date();
  const createdOTPDocument = await OTPRepository.create({
    otp: otp,
    userId: request.userId,
    otpType: request.otpType,
    expirationTime: new Date(now.setDate(now.getDate() + 1)),
    createdAt: new Date(),
    verified: false,
  });

  if (request.otpType === OTPType.VALIDATE_EMAIL) {
    await sendValidationEmail(
      accountDocument.email,
      accountDocument.username,
      createdOTPDocument.otp
    );
  } else if (request.otpType === OTPType.ACCOUNT_CREATED) {
    await sendWelcomeValidationEmail(
      accountDocument.email,
      accountDocument.username,
      createdOTPDocument.otp
    );
  }

  return new CreateOTPResponse();
};

export const updateOTP = async (
  request: UpdateOTPRequest
): Promise<UpdateOTPResponse | ErrorReponse> => {
  const now = new Date();

  const existingOTPDocument = await OTPRepository.findOne({
    userId: request.userId,
    otp: request.otp,
  });

  if (!existingOTPDocument) {
    return new ErrorReponse("OTP não existe", 422);
  }

  if (existingOTPDocument.expirationTime.getTime() > now.getTime()) {
    return new ErrorReponse("OTP expirou", 422);
  }

  const updatedOTPDocument = await OTPRepository.findOneAndUpdate(
    { otp: request.otp, userId: request.userId },
    {
      updatedAt: now,
      verified: true,
    },
    { new: true }
  );

  return new UpdateOTPResponse();
};
