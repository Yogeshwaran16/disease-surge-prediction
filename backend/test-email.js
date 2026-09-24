require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("📧 Testing Gmail SMTP...");
  console.log("SMTP Host:", process.env.SMTP_HOST);
  console.log("SMTP Port:", process.env.SMTP_PORT);
  console.log("SMTP User:", process.env.SMTP_USER);
  console.log("SMTP To:", process.env.ALERT_EMAIL_TO);

  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER is missing in backend/.env");
  }

  if (!process.env.SMTP_PASSWORD) {
    throw new Error("SMTP_PASSWORD is missing in backend/.env");
  }

  if (!process.env.ALERT_EMAIL_TO) {
    throw new Error("ALERT_EMAIL_TO is missing in backend/.env");
  }

 const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

  await transporter.verify();

  console.log("✅ SMTP connection verified");

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.ALERT_EMAIL_TO,
    subject: "TECHNOVA Email Test",
    text: "This is a real email test from TECHNOVA.",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>TECHNOVA Disease Surge Alert</h2>
        <p>This is a real email test from TECHNOVA.</p>
        <p>Gmail SMTP integration is working successfully.</p>
      </div>
    `,
  });

  console.log("✅ Email sent successfully");
  console.log("Message ID:", info.messageId);
}

testEmail().catch((error) => {
  console.error("❌ Email test failed:");
  console.error(error.message);
});