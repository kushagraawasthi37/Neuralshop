import { BaseConsumer } from "../../kafka/base.consumer.js";
import sgMail from "@sendgrid/mail";
import config from "../../config/environment.config.js";
import { logger } from "../../utils/logger.js";

sgMail.setApiKey(config.sendgrid.apiKey);

class MailConsumer extends BaseConsumer {
  constructor() {
    super("mail-group", "emails");
  }

  async processMessage(_topic, _partition, _message, event) {
    switch (event.eventType) {
      case "mail.verification":
        await this._sendVerificationEmail(event.data);
        break;
      case "mail.reset":
        await this._sendPasswordResetEmail(event.data);
        break;
      default:
        logger.warn("MailConsumer: unknown event type", { eventType: event.eventType });
    }
  }

  async _sendVerificationEmail({ email, otp }) {
    await sgMail.send({
      to: email,
      from: config.sendgrid.fromEmail,
      subject: "Email Verification — NeuralShop",
      text: `Your verification OTP is: ${otp}`,
      html: `<p>Your verification OTP is: <strong>${otp}</strong></p>`,
    });
    logger.info("Verification email sent", { email, category: "mail" });
  }

  async _sendPasswordResetEmail({ email, otp }) {
    await sgMail.send({
      to: email,
      from: config.sendgrid.fromEmail,
      subject: "Password Reset — NeuralShop",
      text: `Your password reset OTP is: ${otp}`,
      html: `<p>Your password reset OTP is: <strong>${otp}</strong></p>`,
    });
    logger.info("Password reset email sent", { email, category: "mail" });
  }
}

export const startMailConsumer = async () => {
  const consumer = new MailConsumer();
  try {
    return await consumer.start();
  } catch (err) {
    logger.warn("Mail consumer not started — Kafka may be unavailable", { error: err.message });
  }
};
