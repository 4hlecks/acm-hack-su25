'use client';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const token = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("token")
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5001/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      setMessage(data.message || "Password reset complete.");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  };

  if (!token) {
    return <p>Invalid or missing token. Please use the link from your email.</p>;
  }

  return (
    <main style={{ maxWidth: "500px", margin: "2rem auto", textAlign: "center" }}>
      <h1>Reset Password</h1>

      {message ? (
        <p style={{ marginTop: "1rem" }}>{message}</p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
          <button type="submit" style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
            Reset Password
          </button>
        </form>
      )}
    </main>
  );
}
