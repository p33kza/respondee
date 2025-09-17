import { useState } from 'react';
import { API_BASE_URL } from '../apis/api';

export function useSendOtpEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendOtpEmail = async (email, displayName, otpCode) => {
    setLoading(true);
    setError(null);
    try {
      if (!email) throw new Error('Email is required');
      if (!displayName) throw new Error('Display name is required');
      if (!otpCode) throw new Error('OTP code is required');

      const url = `${API_BASE_URL}/api/email/send`;
      // Only user/context fields; server will add SMTP creds from env
      const payload = {
        email,
        displayName,
        name: displayName,
        otpCode,
        code: String(otpCode),
        otp: String(otpCode),
      };

      console.log('[sendOtpEmail] POST', url, payload);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      console.log('[sendOtpEmail] status', res.status, 'body', raw);

      let data;
      try { data = raw ? JSON.parse(raw) : {}; } catch { data = { error: raw }; }

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Endpoint not found: /api/email/send. Verify route mount in api/index.js.');
        }
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      return { success: true, message: data?.message || 'OTP email sent' };
    } catch (err) {
      console.error('[useSendOtpEmail] send error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { sendOtpEmail, loading, error };
}