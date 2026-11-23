import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "Home Tuition <noreply@hometuition.lk>";
const isConfigured = !!process.env.SMTP_USER && !!process.env.SMTP_PASS;

async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!isConfigured) {
      console.log("\n📧 ============ EMAIL (LOG MODE) ============");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Body:", html.replace(/<[^>]*>/g, "").trim());
      console.log("=============================================\n");
      return { success: true, mode: "log" };
    }
    const info = await transporter.sendMail({ from: FROM, to, subject, html });
    console.log("📧 Email sent:", info.messageId);
    return { success: true, mode: "smtp" };
  } catch (err) {
    console.error("❌ Email error:", err);
    return { success: false, error: String(err) };
  }
}

// 1. WELCOME EMAIL
export async function sendWelcomeEmail(to: string, name: string, role: string) {
  const subject = `Welcome to Home Tuition, ${name}! 🎉`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0A1F37; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Home Tuition</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0A1F37;">Welcome, ${name}!</h2>
        <p style="color: #4b5563;">Your account has been created successfully.</p>
        <p style="color: #4b5563;">Role: <strong>${role}</strong></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" 
           style="display: inline-block; background: #14B8A6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Log In →
        </a>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

// 2. PAYMENT CONFIRMATION EMAIL
export async function sendPaymentEmail(
  to: string,
  name: string,
  amount: number,
  month: string,
  courseTitle: string
) {
  const subject = `Payment Confirmed - Rs. ${amount} for ${month}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0A1F37; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Payment Confirmed ✅</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <p>Hi ${name},</p>
        <p>Your payment was successful!</p>
        <ul>
          <li>Course: ${courseTitle}</li>
          <li>Month: ${month}</li>
          <li>Amount: Rs. ${amount}</li>
        </ul>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

// 3. ABSENCE ALERT EMAIL
export async function sendAbsenceEmail(
  to: string,
  parentName: string,
  studentName: string,
  courseTitle: string,
  date: string
) {
  const subject = `Absence Alert: ${studentName} missed class on ${date}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #F59E0B; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ Absence Alert</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <p>Hi ${parentName},</p>
        <p>${studentName} did not attend:</p>
        <ul>
          <li>Course: ${courseTitle}</li>
          <li>Date: ${date}</li>
        </ul>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}

// 4. TEACHER VERIFIED EMAIL
export async function sendTeacherVerifiedEmail(to: string, name: string) {
  const subject = `Your Teacher Account is Verified! 🎉`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #14B8A6; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">Account Verified ✅</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
        <p>Hi ${name},</p>
        <p>Your teacher account has been verified!</p>
      </div>
    </div>
  `;
  return sendEmail(to, subject, html);
}