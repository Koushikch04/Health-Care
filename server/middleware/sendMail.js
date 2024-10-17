import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const mailSender = async ({ email, otp }) => {
  try {
    let transporter = nodemailer.createTransport({
      service: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const body = `<div>
            <b>${otp} </b> is your otp for reseting your password!
        </div>`;

    let info = await transporter.sendMail({
      from: "www.healthcare.in",
      to: email,
      subject: "Regarding Password Reset",
      html: body,
    });
  } catch (error) {
    console.log(error);
  }
};

export default mailSender;
