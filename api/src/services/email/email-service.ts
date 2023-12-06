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
  otp: string
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
    html: htmlContent,
    attachments: [
      {
        filename: "logo-min.png",
        path: path.resolve(__dirname, "./logo-min.png"),
        cid: "logo",
      },
      {
        filename: "whatsapp.png",
        path: path.resolve(__dirname, "./whatsapp.png"),
        cid: "whatsapp",
      },
      {
        filename: "instagram.png",
        path: path.resolve(__dirname, "./instagram.png"),
        cid: "instagram",
      },
      {
        filename: "facebook.png",
        path: path.resolve(__dirname, "./facebook.png"),
        cid: "facebook",
      },
      {
        filename: "linkedin.png",
        path: path.resolve(__dirname, "./linkedin.png"),
        cid: "linkedin",
      },
      {
        filename: "youtube.png",
        path: path.resolve(__dirname, "./youtube.png"),
        cid: "youtube",
      },
      {
        filename: "twitter.png",
        path: path.resolve(__dirname, "./twitter.png"),
        cid: "twitter",
      },
    ],
  };

  transporter.sendMail(mailData, function (err: any, info: any) {
    if (err) {
      console.log(`NODEMAILER SEND EMAIL ERROR: ${err}`);
    }
  });
};

export const sendWelcomeValidationEmail = async (
  accountUserEmail: string,
  accountUserName: string,
  otp: string
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
    .readFileSync(path.resolve(__dirname, "./welcome-validation-email.html"))
    .toString();

  const htmlContent = htmlContentString
    .replace("__OTP__", otp)
    .replace("__USERNAME__", accountUserName);

  const mailData = {
    from: {
      name: `Portal Atender`,
      address: `${process.env.PORTAL_ATENDER_CONTACTS_DEPARTMENT_EMAILALIAS}`,
    },
    sender: `${process.env.PORTAL_ATENDER_CONTACTS_DEPARTMENT_EMAILALIAS}`,
    to: accountUserEmail,
    subject: `Boas-vindas ${accountUserName}!`,
    html: htmlContent,
    attachments: [
      {
        filename: "logo-min.png",
        path: path.resolve(__dirname, "./logo-min.png"),
        cid: "logo",
      },
      {
        filename: "whatsapp-min.png",
        path: path.resolve(__dirname, "./whatsapp-min.png"),
        cid: "whatsapp",
      },
      {
        filename: "instagram-min.png",
        path: path.resolve(__dirname, "./instagram-min.png"),
        cid: "instagram",
      },
      {
        filename: "facebook-min.png",
        path: path.resolve(__dirname, "./facebook-min.png"),
        cid: "facebook",
      },
      {
        filename: "linkedin-min.png",
        path: path.resolve(__dirname, "./linkedin-min.png"),
        cid: "linkedin",
      },
      {
        filename: "youtube-min.png",
        path: path.resolve(__dirname, "./youtube-min.png"),
        cid: "youtube",
      },
      {
        filename: "twitter-min.png",
        path: path.resolve(__dirname, "./twitter-min.png"),
        cid: "twitter",
      },
    ],
  };

  transporter.sendMail(mailData, function (err: any, info: any) {
    if (err) {
      console.log(`NODEMAILER SEND WELCOME VALIDATION EMAIL ERROR: ${err}`);
    }
  });
};
