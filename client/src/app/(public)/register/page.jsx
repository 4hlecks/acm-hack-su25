'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

import styles from '../page.module.css';      // uses .onboardingPage / .onboardingHeader / .onboardingForm
import { TextField, SelectField } from '../../../components/form/Form';
import { Button } from '../../../components/buttons/Buttons';
import { ChevronDown } from 'react-feather';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001';

export default function RegisterPage() {
  const router = useRouter();

  // form
  const [fullName, setFullName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [accountType, setAccountType]     = useState(''); // 'Student' | 'Club'

  // ui
  const [loading, setLoading]             = useState(false);
  const [errMsg, setErrMsg]               = useState(null);
  const [fieldErr, setFieldErr]           = useState({
    fullName: '', email: '', password: '', confirm: '', accountType: ''
  });

  function validate() {
    const next = { fullName: '', email: '', password: '', confirm: '', accountType: '' };

    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 6) next.password = 'Use at least 6 characters.';
    if (!confirmPassword) next.confirm = 'Please confirm your password.';
    else if (password !== confirmPassword) next.confirm = 'Passwords do not match.';
    if (!accountType) next.accountType = 'Select an account type.';

    setFieldErr(next);
    return Object.values(next).every(v => !v);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrMsg(null);
    if (!validate()) return;

    const role = accountType === 'Club' ? 'club' : 'user';

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role, // 'user' or 'club'
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // success → go to login
      router.push('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setErrMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.centeredPage}>
      <header className={styles.onboardingHeader}>
        <h1>Create Account</h1>
      </header>

      {errMsg && (
        <div className={styles.errorBanner} role="alert">
          {errMsg}
        </div>
      )}

      <form className={styles.onboardingForm} onSubmit={handleSubmit} noValidate>
        <TextField
          id="fullName"
          label="Full Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          error={fieldErr.fullName}
          fieldWidth="100%"
        />

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          error={fieldErr.email}
          fieldWidth="100%"
        />

        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          error={fieldErr.password}
          fieldWidth="100%"
        />

        <TextField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm your password"
          error={fieldErr.confirm}
          fieldWidth="100%"
        />

        <SelectField
          id="accountType"
          label="Account Type"
          required
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          placeholder="Select your account type"
          icon={<ChevronDown size={16} />}
          error={fieldErr.accountType}
          fieldWidth="100%"
        >
          <option value="Student">Student</option>
          <option value="Club">Club</option>
        </SelectField>


        <Button
          type="submit"
          width="fill"
          variant="secondary"
          disabled={loading}
          aria-busy={loading ? 'true' : undefined}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <p className={styles.onboardingAlternate}>
          Have an account?{' '}
          <Link href="/login" className={styles.bodyLink}>
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
