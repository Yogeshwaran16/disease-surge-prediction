const CHANNELS = {
  DASHBOARD: "dashboard",
  EMAIL: "email",
  SMS: "sms",
  WHATSAPP: "whatsapp",
};

const PRIORITY_CHANNELS = {
  LOW: [],
  MEDIUM: [CHANNELS.DASHBOARD],
  HIGH: [
    CHANNELS.DASHBOARD,
    CHANNELS.EMAIL,
  ],
  CRITICAL: [
    CHANNELS.DASHBOARD,
    CHANNELS.EMAIL,
    CHANNELS.SMS,
    CHANNELS.WHATSAPP,
  ],
};

const RETRY_CONFIG = {
  max_attempts: 3,
  backoff_seconds: [30, 120, 300],
};

const NOTIFICATION_CONFIG = {
  provider_mode: process.env.NOTIFICATION_PROVIDER_MODE || "mock",
  channels: CHANNELS,
  priority_channels: PRIORITY_CHANNELS,
  retry: RETRY_CONFIG,
  sla_minutes: 5,
};

module.exports = {
  CHANNELS,
  PRIORITY_CHANNELS,
  RETRY_CONFIG,
  NOTIFICATION_CONFIG,
};
