'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import styles from '../page.module.css'; // uses .onboarding + friends you already have
import { TextField } from '../../../components/form/Form';
import { Button } from '../../../components/buttons/Buttons';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001';

export default function LoginPage() {
  const router = useRouter();

  // form state
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // ui state
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg]   = useState(null);

  // field-level errors
  const [fieldErr, setFieldErr] = useState({ email: '', password: '' });

  function validate() {
    const next = { email: '', password: '' };
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';

    if (!password) next.password = 'Password is required.';
    setFieldErr(next);

    return !next.email && !next.password;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setErrMsg(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // If you later switch to httpOnly refresh cookies, add: credentials: 'include'
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      // Persist (your backend currently returns token + user)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);

	  window.dispatchEvent(new Event("authChanged"));

      alert("Logged in successfully!");
	  
      // Route by role
      if (data.user.role === 'admin') router.push('/admin/dashboard');
      else router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      setErrMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.centeredPage}>
      <header className={styles.onboardingHeader}>
        <h1>Log in</h1>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>
          Log in to manage or save events!
        </p>
      </header>

      {/* Error banner */}
      {errMsg && (
        <div className={styles.errorBanner} role="alert">
          {errMsg}
        </div>
      )}

      <form className={styles.onboardingForm} onSubmit={handleLogin} noValidate>
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

        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
		  placeholder="Enter your password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErr.password}
          fieldWidth="100%"
        />

        {/* Forgot password */}
        <span className={styles.forgotPassword}>
          <Link href="/forgot-password" className={styles.bodyLink}>
            Forgot your password?
          </Link>
        </span>

        {/* Log in */}
        <Button
          type="submit"
          width="fill"
          variant="secondary"
          disabled={loading}
          aria-busy={loading ? 'true' : undefined}
        >
          {loading ? 'Logging in…' : 'Log in'}
        </Button>

        {/* Sign up */}
        <p className={styles.onboardingAlternate}>
          First time here?{' '}
          <Link href="/register" className={styles.bodyLink}>
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
