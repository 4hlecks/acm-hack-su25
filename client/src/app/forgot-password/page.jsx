'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "Check your email for reset instructions.");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Try again.");
    }
  };

  return (
    <main style={{ maxWidth: "500px", margin: "2rem auto", textAlign: "center" }}>
      <h1>Forgot Password</h1>
      <p>Enter your email and we’ll send you a reset link.</p>

      <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
        <input
          type="email"
          value={email}
          placeholder="Your email"
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem" }}
        />
        <button type="submit" style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
          Send Reset Link
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </main>
  );
}
