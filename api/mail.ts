import nodemailer from "nodemailer";

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing mail environment variable: ${name}`);
  }
  return value;
}

function getTransporter() {
  return nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: required("SMTP_USER"),
      pass: required("SMTP_PASS"),
    },
  });
}

export async function sendMail(input: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const transporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME || "KNOTXANDKRAFTS";
  const fromEmail = required("SMTP_FROM_EMAIL");

  return transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: Array.isArray(input.to) ? input.to.join(", ") : input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });
}
