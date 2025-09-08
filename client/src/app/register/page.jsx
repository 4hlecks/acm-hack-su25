'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accountType) {
      alert('Please select an account type.');
      return;
    }
    alert(`Account created as ${accountType}!`);
    // You can redirect or process data here
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
              required
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.8rem' }}
            />
          </label>

          <label>
            Full Name:
            <input
              type="text"
              placeholder="Full Name"
              required
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.8rem' }}
            />
          </label>

          <label>
            Email:
            <input
              type="email"
              placeholder="Email"
              required
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.8rem' }}
            />
          </label>

          <label>
            Password:
            <input
              type="password"
              placeholder="Password"
              required
              style={{ width: '100%', padding: '0.5rem', marginBottom: '0.8rem' }}
            />
          </label>

          <label>
            Confirm Password:
            <input
              type="password"
              placeholder="Confirm Password"
              required
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
                onChange={(e) => setAccountType(e.target.value)}
              /> Student
            </label>
            <label style={{ display: 'block' }}>
              <input
                type="radio"
                name="accountType"
                value="Club"
                onChange={(e) => setAccountType(e.target.value)}
              /> Club <span style={{ fontSize: '0.9rem' }}>(Must use school email)</span>
            </label>
          </fieldset>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#F0B323',
              border: 'none',
              cursor: 'pointer'
            }}>
            Create Account
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
