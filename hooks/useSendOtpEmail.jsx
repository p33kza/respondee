import { useState } from 'react';
import { API_BASE_URL } from '../apis/api';

const normalizeError = (err) => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  const unwrap = (e) => {
    if (!e) return null;
    if (typeof e === 'string') return e;
    if (e.message && typeof e.message === 'string') return e.message;
    if (e.error) return unwrap(e.error);
    if (Array.isArray(e.errors)) {
      const msgs = e.errors.map(unwrap).filter(Boolean);
      if (msgs.length) return msgs.join('; ');
    }
    if (e.code && e.message) return `${e.code}: ${e.message}`;
    return null;
  };
  const msg = unwrap(err);
  if (msg) return msg;
  try { return JSON.stringify(err); } catch { return String(err); }
};

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
        const serverMsg =
          data?.error?.message ||
          data?.message ||
          data?.error_description ||
          raw ||
          `HTTP ${res.status}`;
        const enriched = {
          status: res.status,
          code: data?.error?.code || data?.code,
          message: typeof serverMsg === 'string' ? serverMsg : JSON.stringify(serverMsg),
        };
        throw enriched;
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