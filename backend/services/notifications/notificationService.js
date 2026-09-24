const Alert = require("../../models/Alert");

const {
  PRIORITY_CHANNELS,
  RETRY_CONFIG,
} = require("./channelConfig");

const notificationProvider = require("./notificationProvider");

class NotificationService {
  getChannelsForPriority(priority) {
    return PRIORITY_CHANNELS[priority] || [];
  }

  async sendWithRetry(channel, payload) {
    let lastError = null;

    for (
      let attempt = 1;
      attempt <= RETRY_CONFIG.max_attempts;
      attempt++
    ) {
      try {
        const result = await notificationProvider.send(
          channel,
          payload
        );

        if (result?.success) {
          return {
            ...result,
            status: "delivered",
            attempts: attempt,
            sent_at: new Date(),
            delivered_at: new Date(),
            last_attempt_at: new Date(),
          };
        }

        lastError = new Error(
          result?.message || `${channel} delivery failed`
        );
      } catch (error) {
        lastError = error;
      }

      if (attempt < RETRY_CONFIG.max_attempts) {
        const delaySeconds =
          RETRY_CONFIG.backoff_seconds[attempt - 1] || 30;

        await new Promise((resolve) =>
          setTimeout(resolve, delaySeconds * 1000)
        );
      }
    }

    return {
      success: false,
      channel,
      status: "failed",
      attempts: RETRY_CONFIG.max_attempts,
      error: lastError?.message || "Delivery failed",
      last_attempt_at: new Date(),
    };
  }

  async sendAlert(alert) {
    const channels = this.getChannelsForPriority(alert.priority);

    const results = [];

    for (const channel of channels) {
      const result = await this.sendWithRetry(channel, {
        alert_id: alert._id,
        district: alert.district,
        disease: alert.disease,
        risk_level: alert.risk_level,
        priority: alert.priority,
        probability: alert.probability,
        message: alert.message,
        english_alert: alert.english_alert,
        tamil_alert: alert.tamil_alert,
      });

      results.push({
        channel,
        status: result.status,
        attempts: result.attempts || 0,
        reference_id: result.reference_id || null,
        error: result.error || null,
        sent_at: result.sent_at || null,
        delivered_at: result.delivered_at || null,
        last_attempt_at: result.last_attempt_at || null,
      });
    }

    const delivered = results.filter(
      (item) => item.status === "delivered"
    ).length;

    const failed = results.filter(
      (item) => item.status === "failed"
    ).length;

    const pending = results.filter(
      (item) => item.status === "pending"
    ).length;

    const lastAttempt = results
      .map((item) => item.last_attempt_at)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] || null;

    const updatedAlert = await Alert.findByIdAndUpdate(
      alert._id,
      {
        $set: {
          deliveries: results,
          delivery_summary: {
            total_channels: results.length,
            delivered,
            failed,
            pending,
            last_attempt_at: lastAttempt,
          },
        },
      },
      {
        new: true,
      }
    );

    return {
      alert_id: alert._id,
      priority: alert.priority,
      channels,
      total_channels: results.length,
      delivered,
      failed,
      pending,
      results,
      alert: updatedAlert,
    };
  }
}

module.exports = new NotificationService();