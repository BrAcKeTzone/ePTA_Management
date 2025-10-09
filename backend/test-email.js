// Email configuration test script
import dotenv from "dotenv";
import sendEmail from "./src/utils/email.js";

dotenv.config();

console.log("Testing email configuration...");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_PORT:", process.env.EMAIL_PORT);
console.log("EMAIL_USERNAME:", process.env.EMAIL_USERNAME);
console.log("EMAIL_PASSWORD exists:", !!process.env.EMAIL_PASSWORD);

async function testEmail() {
  try {
    console.log("Attempting to send test email...");

    await sendEmail({
      email: "test@example.com", // Replace with your test email
      subject: "Test Email from ePTA System",
      message: "This is a test email to verify email configuration.",
    });

    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}

testEmail();
