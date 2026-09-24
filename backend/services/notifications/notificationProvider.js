const nodemailer = require("nodemailer");

const {
  CHANNELS,
} = require("./channelConfig");

class NotificationProvider {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async send(channel, payload = {}) {
    switch (channel) {
      case CHANNELS.DASHBOARD:
        return this.sendDashboard(payload);

      case CHANNELS.EMAIL:
        return this.sendEmail(payload);

      case CHANNELS.SMS:
        return this.sendSMS(payload);

      case CHANNELS.WHATSAPP:
        return this.sendWhatsApp(payload);

      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }

  async sendDashboard(payload) {
    return {
      success: true,
      channel: CHANNELS.DASHBOARD,
      provider: "mock",
      message: "Dashboard alert recorded",
      reference_id: `dashboard-${Date.now()}`,
      payload,
    };
  }

  async sendEmail(payload) {
    if (process.env.NOTIFICATION_PROVIDER_MODE !== "live") {
      return {
        success: true,
        channel: CHANNELS.EMAIL,
        provider: "mock",
        message: "Email delivery simulated",
        reference_id: `email-${Date.now()}`,
        payload,
      };
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error("SMTP credentials are not configured");
    }

    const recipient =
      payload.to ||
      payload.email ||
      process.env.ALERT_EMAIL_TO ||
      process.env.SMTP_USER;

    const subject =
      payload.subject ||
      `TECHNOVA Disease Alert - ${payload.disease || "Health Alert"}`;

    const message =
      payload.message ||
      payload.english_alert ||
      "TECHNOVA disease surge alert";

    const info = await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipient,
      subject,
      text: message,
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>TECHNOVA Disease Surge Alert</h2>
          <p>${message}</p>
        </div>
      `,
    });

    return {
      success: true,
      channel: CHANNELS.EMAIL,
      provider: "gmail-smtp",
      message: "Email delivered successfully",
      reference_id: info.messageId,
      payload,
    };
  }

  async sendSMS(payload) {
    return {
      success: true,
      channel: CHANNELS.SMS,
      provider: "mock",
      message: "SMS delivery simulated",
      reference_id: `sms-${Date.now()}`,
      payload,
    };
  }

  async sendWhatsApp(payload) {
    return {
      success: true,
      channel: CHANNELS.WHATSAPP,
      provider: "mock",
      message: "WhatsApp delivery simulated",
      reference_id: `whatsapp-${Date.now()}`,
      payload,
    };
  }
}

module.exports = new NotificationProvider();