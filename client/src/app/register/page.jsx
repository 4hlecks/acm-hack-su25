'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();

  // form state
  const [username, setUsername] = useState(''); // (optional) not sent to backend yet
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState(''); // "Student" or "Club"
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountType) {
      alert('Please select an account type.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Map UI selection -> backend role
    const role = accountType === 'Club' ? 'club' : 'user';

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,  // backend expects "name"
          email,
          password,
          role,            // "user" or "club"
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      alert(` ${data.message}`);
      router.push('/login');
    } catch (err) {
      console.error(' Registration error:', err);
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #ccc',
        padding: '0.8rem 1.5rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* If /logo.png is 404, either add the file under /public or remove this <img> */}
        <img src="/logo.png" alt="App Logo" style={{ height: '30px', marginRight: '0.75rem' }} />
        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>EventConnect</h2>
      </header>

      {/* Main Content */}
      <main style={{
        flex: '1',
        maxWidth: '400px',
        margin: 'auto',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 'bold' }}>Sign Up</h1>
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', textAlign: 'left' }}>
          <label>
            Username:
            <input
              type="text"
              placeholder="Create a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.8rem' }}
            />
          </label>

          <label>
            Full Name:
            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.8rem' }}
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.8rem' }}
            />
          </label>

          <label>
            Password:
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.8rem' }}
            />
          </label>

          <label>
            Confirm Password:
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
          </label>

          <fieldset style={{ marginBottom: '1.2rem' }}>
            <legend style={{ fontWeight: 'bold' }}>Account Type:</legend>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="radio"
                name="accountType"
                value="Student"
                checked={accountType === 'Student'}
                onChange={(e) => setAccountType(e.target.value)}
              /> Student
            </label>
            <label style={{ display: 'block' }}>
              <input
                type="radio"
                name="accountType"
                value="Club"
                checked={accountType === 'Club'}
                onChange={(e) => setAccountType(e.target.value)}
              /> Club <span style={{ fontSize: '0.9rem' }}>(Must use school email)</span>
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: submitting ? '#d6d6d6' : '#F0B323',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <p>Already have an account?</p>
          <button
            onClick={() => router.push('/login')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#F0B323',
              border: 'none',
              cursor: 'pointer'
            }}>
            Go to Login
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#001f3f',
        height: '40px',
        width: '100%'
      }} />
    </div>
  );
}
