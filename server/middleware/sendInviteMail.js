import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendInviteMail = async ({ email, inviteLink }) => {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_HOST,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const body = `<div>
      <p>You have been invited to HealthCare Management.</p>
      <p>Click the link below to set your password and activate your account:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>This link expires in 24 hours.</p>
    </div>`;

  await transporter.sendMail({
    from: "www.healthcare.in",
    to: email,
    subject: "Set your password - HealthCare invite",
    html: body,
  });
};

export default sendInviteMail;
