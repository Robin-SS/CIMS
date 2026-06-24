import { AlertCircle } from 'lucide-react';
import cafeLogo from '../assets/cafeLogo.png';
import loginBG from '../assets/loginBG.png'

interface LoginUIProps {
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  isSubmitting: boolean;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
}

export default function LoginUI({ 
  onSubmit, error, isSubmitting, username, setUsername, password, setPassword 
}: LoginUIProps) {
  
  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f5e6d8',
        backgroundImage: `url(${loginBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        padding: '24px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* White Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '36px',
          padding: '56px 60px',
          width: '100%',
          maxWidth: '580px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          width: '100%',
          marginBottom: '8px',
        }}
      >
        {/* Coffee Image */}
        <img
          src={cafeLogo}
          alt="Tita's Cafe Logo"
          style={{
            width: '140px',
            height: '140px',
            objectFit: 'contain',
            filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.25))',
          }}
        />

        {/* Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            lineHeight: 1,
            color: '#000',
            fontFamily: '"Liu Jian Mao Cao", cursive',
            textShadow: '0px 4px 4px rgba(0,0,0,0.25)',
          }}
        >
          <span
            style={{
              fontSize: '64px',
            }}
          >
            Tita's
          </span>

          <span
            style={{
              fontSize: '64px',
              marginTop: '-6px',
            }}
          >
            Cafe
          </span>
        </div>
      </div>
        {/* Good Day */}
        
        <p style={{ fontSize: '40px', fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Good Day!</p>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {error && (
            <div style={{
              backgroundColor: '#fff1f0',
              border: '1px solid #fca5a5',
              borderRadius: '14px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#dc2626',
              fontSize: '16px',
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '19px', fontWeight: 700, color: '#1a1a1a' }}>Role</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or staff"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: '#f0e7df',
                padding: '16px 20px',
                borderRadius: '18px',
                fontSize: '17px',
                color: '#5a483e',
                border: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '19px', fontWeight: 700, color: '#1a1a1a' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: '#f0e7df',
                padding: '16px 20px',
                borderRadius: '18px',
                fontSize: '17px',
                color: '#5a483e',
                border: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: '#c29676',
              color: '#ffffff',
              padding: '18px',
              borderRadius: '999px',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#a88266')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#c29676')}
          >
            {isSubmitting ? 'Verifying...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}