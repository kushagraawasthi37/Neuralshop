// Mail Consumer - Consumes mail events and sends emails via SendGrid
import { createKafkaConsumer } from "../../config/kafka.js";
import sgMail from "@sendgrid/mail";
import config from "../../config/environment.config.js";

sgMail.setApiKey(config.sendgrid.apiKey);

export const startMailConsumer = async () => {
  const consumer = createKafkaConsumer("mail-group");
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "emails" });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        console.log("Mail event consumed:", event);

        // Handle mail events
        switch (event.eventType) {
          case "mail.verification":
            await sendVerificationEmail(event.data);
            break;
          case "mail.reset":
            await sendPasswordResetEmail(event.data);
            break;
          default:
            console.log("Unknown mail event");
        }
      },
    });
  } catch (error) {
    // console.error("Error starting mail consumer:", error);
    console.warn("Mail consumer not started - Kafka may not be available");
  }
};

const sendVerificationEmail = async ({ email, otp }) => {
  const msg = {
    to: email,
    from: config.sendgrid.fromEmail,
    subject: "Email Verification",
    text: `Your verification OTP is: ${otp}`,
    html: `<p>Your verification OTP is: <strong>${otp}</strong></p>`,
  };
  try {
    await sgMail.send(msg);
    console.log("Verification email sent to", email);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

const sendPasswordResetEmail = async ({ email, otp }) => {
  const msg = {
    to: email,
    from: config.sendgrid.fromEmail,
    subject: "Password Reset",
    text: `Your password reset OTP is: ${otp}`,
    html: `<p>Your password reset OTP is: <strong>${otp}</strong></p>`,
  };
  try {
    await sgMail.send(msg);
    console.log("Password reset email sent to", email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};
