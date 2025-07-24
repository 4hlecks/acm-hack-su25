'use client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/register');
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
        <img src="/logo.png" alt="App Logo" style={{ height: '40px', marginRight: '1rem' }} />
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>APP NAME</h2>
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
        <form style={{ textAlign: 'left', marginTop: '2rem' }}>
          <label>
            Username or email:<br />
            <input
              type="text"
              placeholder="Enter your email or username"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
            />
          </label>
          <br /><br />
          <label>
            Password:<br />
            <input
              type="password"
              placeholder="Enter your password"
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.3rem' }}
            />
          </label>
          <br />
          <a href="#" style={{ fontSize: '0.9rem' }}>Forgot password?</a>
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
        backgroundColor: '#001f3f', // Navy blue
        height: '60px',
        width: '100%',
        marginTop: '2rem'
      }} />
    </div>
  );
}

