// import { useState } from 'react';
// import { API_BASE_URL } from '../apis/api';

// export function useSendOtpEmail() {
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   // POST /api/otp/send -> { message, expiresInMinutes }
//   const sendOtpEmail = async (email, displayName) => {
//     setLoading(true);
//     setError(null);
//     setSuccess(false);

//     try {
//       // Original endpoint (commented out for reference)
//       // const response = await fetch('https://innovatechservicesph.com/api/email', {
//       //   method: 'POST',
//       //   headers: { 'Content-Type': 'application/json' },
//       //   body: JSON.stringify({
//       //     api_key: 'A0466E9D-FC3A-4B94-9DB4-1ADBB7F41AAD',
//       //     smtp_host: 'smtp.hostinger.com',
//       //     smtp_port: 587,
//       //     smtp_user: 'support@tcuregistrarrequest.site',
//       //     smtp_password: '#228JyiuS',
//       //     use_tls: true,
//       //     to_email: email,
//       //     to_name: displayName,
//       //     from_name: 'Respondee',
//       //     subject: 'Your OTP Code',
//       //     body: htmlBody,
//       //   }),
//       // });

//       // New backend integration
//       if (!email) throw new Error('Email is required');

//       const res = await fetch(`${API_BASE_URL}/api/otp/send`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email,
//           name: displayName || 'User',
//         }),
//       });

//       const raw = await res.text();
//       let data;
//       try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw }; }

//       if (!res.ok) {
//         throw new Error(data?.error || `Failed to send OTP (${res.status})`);
//       }

//       setSuccess(true);
//       return {
//         success: true,
//         message: data?.message || 'OTP sent',
//         expiresInMinutes: data?.expiresInMinutes,
//         status: res.status,
//       };
//     } catch (err) {
//       setError(err.message);
//       return { success: false, error: err.message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // POST /api/otp/verify -> { verified: true }
//   const verifyOtp = async (email, code) => {
//     setVerifying(true);
//     setError(null);

//     try {
//       if (!email) throw new Error('Email is required');
//       if (!code || String(code).length !== 6) {
//         throw new Error('Enter the 6-digit code');
//       }

//       const res = await fetch(`${API_BASE_URL}/api/otp/verify`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, code: String(code) }),
//       });

//       const raw = await res.text();
//       let data;
//       try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw }; }

//       if (!res.ok) {
//         throw new Error(data?.error || `Verification failed (${res.status})`);
//       }

//       return { success: true, verified: !!data?.verified, status: res.status };
//     } catch (err) {
//       setError(err.message);
//       return { success: false, verified: false, error: err.message };
//     } finally {
//       setVerifying(false);
//     }
//   };

//   return { sendOtpEmail, verifyOtp, loading, verifying, error, success };
// }