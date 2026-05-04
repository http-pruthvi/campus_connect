import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// Configure the email transport using the default SMTP transport and a GMail account.
// For production, you'd configure this using Firebase Secret Manager
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "noreply.campusconnect@gmail.com",
    pass: process.env.EMAIL_PASS || "mock-password-123",
  },
});

export const sendFeeReceiptEmail = onDocumentUpdated("fees/{feeId}", async (event) => {
  const change = event.data;
  if (!change) return null;

  const before = change.before.data();
  const after = change.after.data();

  // Check if the fee went from unpaid to paid
  const wasPaid = before.paidAmount >= before.totalAmount;
  const isPaid = after.paidAmount >= after.totalAmount;

  if (wasPaid || !isPaid) {
    return null;
  }

  const studentName = after.studentName || "Student";
  // Real app would fetch the user's email from the users collection or auth
  // Mocking email here for demonstration
  const studentEmail = `${studentName.replace(/\s+/g, "").toLowerCase()}@example.com`;

  const mailOptions = {
    from: '"Campus Connect Support" <noreply.campusconnect@gmail.com>',
    to: studentEmail,
    subject: `Fee Payment Receipt - ${after.feeType || "Tuition"}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Payment Confirmation</h2>
        <p>Dear ${studentName},</p>
        <p>We have successfully received your payment for <strong>${after.feeType || "Fees"}</strong>.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Amount Paid:</strong> ₹${after.paidAmount.toLocaleString("en-IN")}</p>
          <p style="margin: 0;"><strong>Transaction ID:</strong> ${after.transactions?.[after.transactions.length - 1]?.txId || "N/A"}</p>
          <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
        </div>
        <p>Your fee status has been updated in the portal. You can log in to Campus Connect anytime to view your updated dashboard and download your detailed PDF receipt.</p>
        <br/>
        <p style="color: #64748b; font-size: 14px;">Regards,<br/>Campus Connect Administration</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Receipt email sent to ${studentEmail}`);
  } catch (error) {
    logger.error("Error sending receipt email:", error);
  }

  return null;
});
