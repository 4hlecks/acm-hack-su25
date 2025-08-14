'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState('');
  const [password, setPassword] = useState('');           
  const [confirmPassword, setConfirmPassword] = useState(''); 

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!accountType) {
      alert('Please select an account type.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    alert(`Account created as ${accountType}!`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: `url('/background.jpg')`,  
      backgroundSize: 'cover',                
      backgroundPosition: 'center',               
      backgroundRepeat: 'no-repeat',              
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#001f3f',
        //borderBottom: '1px solid #ccc',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <img src="/logo.png" alt="App Logo" style={{ height: '30px', marginRight: '0.75rem' }} />
        <h2 style={{ 
          margin: 0, 
          fontSize: '1.5rem',
          fontWeight: '550',
          color: '#f0f0f0'
        }}>
          EventConnect
        </h2>
      </header>

      {/* Main Content */}
      <main style={{
        flex: '1',
        display: 'flex',                      
        justifyContent: 'center',             
        alignItems: 'center',                
        padding: '1.5rem'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          borderRadius: '10px',                      
          padding: '2rem',                             
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'    
        }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 'bold', textAlign: 'center' }}>Sign Up</h1>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <label>
              Username:
              <input
                type="text"
                placeholder="Create a username"
                required
                style={{
                  backgroundColor: '#f0f0f0',       
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.8rem',
                  border: '1px solid #ccc',           
                  borderRadius: '4px'                
                }}
              />
            </label>

            <label>
              Full Name:
              <input
                type="text"
                placeholder="Full Name"
                required
                style={{
                  backgroundColor: '#f0f0f0',         
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.8rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </label>

            <label>
              Email:
              <input
                type="email"
                placeholder="Email"
                required
                style={{
                  backgroundColor: '#f0f0f0',
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.8rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
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
                style={{
                  backgroundColor: '#f0f0f0',
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.8rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </label>

            <label>
              Confirm Password:
              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}                 // ✅ for matching
                onChange={(e) => setConfirmPassword(e.target.value)} // ✅ update confirm state
                style={{
                  backgroundColor: '#f0f0f0',
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
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

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
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
