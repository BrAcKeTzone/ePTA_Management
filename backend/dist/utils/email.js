"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const createTransporter = () => {
    const config = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    };
    return nodemailer_1.default.createTransport(config);
};
const sendEmail = async (options) => {
    // Log email configuration (without password)
    console.log("Email Configuration:", {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USERNAME,
        hasPassword: !!process.env.EMAIL_PASSWORD,
    });
    const transporter = createTransporter();
    const mailOptions = {
        from: "ePTA Management System <hello@epta.io>",
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    console.log("Attempting to send email to:", options.email);
    try {
        const result = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", result.messageId);
    }
    catch (error) {
        console.error("❌ Email sending failed:", error);
        throw error;
    }
};
exports.default = sendEmail;
//# sourceMappingURL=email.js.map