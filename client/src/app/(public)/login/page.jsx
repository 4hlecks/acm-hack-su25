'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    router.push('/register');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5001/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token + user info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);

      alert("Logged in successfully!");

      // redirect admins to dashboard, others to homepage
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
      {/* Top Navigation Bar */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #ccc',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
      }}>
        <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'black' }}>
          current
        </Link>
      </header>

      {/* Main Content */}
      <main style={{
        flex: '1',
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Login</h1>
        <p>Log in to manage or save events</p>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ textAlign: 'left', marginTop: '2rem' }}>
          <label>
            Username or email:<br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
              required
            />
          </label>
          <br /><br />
          <label>
            Password:<br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
              required
            />
          </label>
          <br />
          <a href="/forgot-password" style={{ fontSize: '0.9rem' }}>Forgot password?</a>
          <br /><br />
          <div style={{ textAlign: 'center' }}>
            <button type="submit" style={{ padding: '0.5rem 1rem' }}>
              Log In
            </button>
          </div>
        </form>

        {/* Sign-up Section */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Don’t have an account?</p>
          <button
            onClick={handleSignUp}
            style={{
              margin: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#F0B323',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#001f3f', 
        height: '60px',
        width: '100%',
        marginTop: '2rem'
      }} />
    </div>
  );
}
