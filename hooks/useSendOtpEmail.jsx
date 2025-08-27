import { useState } from 'react';

export function useSendOtpEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

 const sendOtpEmail = async (email, displayName, otpCode) => {
  setLoading(true);
  setError(null);
  setSuccess(false);

    try {
      const htmlBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: Arial, sans-serif; background-color: #f9fafb; color: #333; margin: 0; padding: 0; }
            .container { max-width: 500px; margin: 40px auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); }
            .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eaeaea; }
            .header h2 { margin: 0; color: #FF9500; }
            .message { font-size: 16px; margin: 25px 0; line-height: 1.6; }
            .otp-box { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #111827; border-radius: 8px; letter-spacing: 4px; }
            .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h2>From Respondee</h2></div>
            <div class="message">
              <p>Hello <strong>${displayName}</strong>,</p>
              <p>Here’s your new One-Time Password (OTP) for secure verification:</p>
              <div class="otp-box">${otpCode}</div>
              <p>This code will expire in 10 minutes. If you didn’t request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">&copy; 2025 Respondee. All rights reserved.</div>
          </div>
        </body>
        </html>
      `;
 
 const response = await fetch('https://innovatechservicesph.com/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: 'A0466E9D-FC3A-4B94-9DB4-1ADBB7F41AAD',
    smtp_host: 'smtp.hostinger.com',
    smtp_port: 587,
    smtp_user: 'support@tcuregistrarrequest.site',
    smtp_password: '#228JyiuS', 
    use_tls: true,
    to_email: email,
    to_name: displayName,
    from_name: 'Respondee',
    subject: 'Your OTP Code',
    body: htmlBody,
  }),
});

const data = await response.json(); // ✅ basahin yung body

if (!response.ok || !data.message?.includes("success")) {
  throw new Error(data.message || 'Failed to send OTP email');
}

setSuccess(true);
return { success: true };

  } catch (err) {
    setError(err.message);
    return { success: false, error: err.message }; // ✅ important
  } finally {
    setLoading(false);
  }
};


  return { sendOtpEmail, loading, error, success };
}
