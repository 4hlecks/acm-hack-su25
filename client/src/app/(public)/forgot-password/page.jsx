'use client';
import { useState } from 'react';
import { TextField } from '../../../components/form/Form';
import { Button } from '../../../components/buttons/Buttons';
import styles from '../page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  // UI
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg]   = useState(null);
  const [okMsg, setOkMsg]     = useState(null);

  // field-level errors
  const [fieldErr, setFieldErr] = useState({ email: '' });

  function validate() {
    const next = { email: '' };
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    setFieldErr(next);
    return !next.email;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrMsg(null);
    setOkMsg(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to send reset link.');

      setOkMsg(data.message || 'Check your email for reset instructions.');
    } catch (err) {
      console.error('Forgot password error:', err);
      setErrMsg(err.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.centeredPage}>
      <header className={styles.onboardingHeader}>
        <h1>Forgot password</h1>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>
          Enter your email and we will send you a reset link.
        </p>
      </header>

      {errMsg && (
        <div className={styles.errorBanner} role="alert">
          {errMsg}
        </div>
      )}
      {okMsg && (
        <div className={styles.successBanner} role="status">
          {okMsg}
        </div>
      )}

      <form className={styles.onboardingForm} onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErr.email}
          fieldWidth="100%"
        />

        <Button
          type="submit"
          width="fill"
          variant="secondary"
          disabled={loading}
          aria-busy={loading ? 'true' : undefined}
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </main>
  );
}