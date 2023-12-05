/** @format */

import nodemailer from "nodemailer";
import { AccountRepository } from "../../db/models/AccountRepository";
import ErrorReponse from "../../models/errors/ErrorResponse";

import fs from "fs";
import path from "path";

// export const sendValidationEmailViaUserId = async (
//   userId: string
// ): Promise<void | ErrorReponse> => {
//   const accountDocument = await AccountRepository.findOne({ userId: userId });
//   if (!accountDocument) {
//     return new ErrorReponse("Conta não existe", 422);
//   }

//   const createOtpResponse = await createOTP

//   await sendValidationEmail(accountDocument.email, accountDocument.username, )
// };

export const sendValidationEmail = async (
  accountUserEmail: string,
  accountUserName: string,
  otp: string,
  expirationTime: Date
) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.PORTAL_ATENDER_MAIN_GMAIL_ACCOUNT,
      pass: process.env.PORTAL_ATENDER_API_APPPASSWORD_GMAIL,
    },
    secure: true,
  });

  const htmlContentString = fs
    .readFileSync(path.resolve(__dirname, "./validation-email.html"))
    .toString();

  const htmlContent = htmlContentString.replace("__OTP__", otp);

  const mailData = {
    from: {
      name: `Portal Atender`,
      address: `${process.env.PORTAL_ATENDER_CONTACTS_DEPARTMENT_EMAILALIAS}`,
    },
    sender: `${process.env.PORTAL_ATENDER_CONTACTS_DEPARTMENT_EMAILALIAS}`,
    to: accountUserEmail,
    subject: `Olá ${accountUserName}, aqui está o seu código de validação`,
    //html: `<div><h1>Email: ${accountUserEmail}</h1></div><div><h3>Name: ${accountUserName}</h3></div><div>YOUR OTP CODE: ${otp}</div>`,
    html: htmlContent,
    attachments: [
      {
        filename: "logo.png",
        path: path.resolve(__dirname, "./logo.png"),
        cid: "logo",
      },
      {
        filename: "whatsapp.png",
        path: path.resolve(__dirname, "./whatsapp.png"),
        cid: "whatsapp",
      },
    ],
  };

  transporter.sendMail(mailData, function (err: any, info: any) {
    if (err) {
      console.log(`NODEMAILER SEND EMAIL ERROR: ${err}`);
    }
  });
};
