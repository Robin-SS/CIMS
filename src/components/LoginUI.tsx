import { AlertCircle } from 'lucide-react';
import cafeLogo from '../assets/cafeLogo.png';
import loginBG from '../assets/LoginBG2.png'

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
        justifyContent: 'flex-end',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        backgroundImage: `url(${loginBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        padding: '24px',
        paddingRight: '4vw',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Outlined Panel (no fill, no shadow) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: `3px solid #f2d8c3`,
          borderRadius: '28px',
          padding: '48px 56px',
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 0px 5px #d772204d',
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
            marginBottom: '4px',
          }}
        >
          <img
            src={cafeLogo}
            alt="Tita's Cafe Logo"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.18))',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              lineHeight: 1,
              color: '#1E1E1E',
              fontFamily: '"Liu Jian Mao Cao", cursive',
              fontWeight: '800',
            }}
          >
            <span style={{ fontSize: '48px' }}>Tita's</span>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');`}</style>
            <span style={{ fontSize: '48px', marginTop: '-6px' }}>Cafe</span>
          </div>
        </div>

        {/* Good Day */}
        <div
          style={{
            border: `3px solid #f2d8c3`,
            borderRadius: '999px',
            padding: '8px 0',
            width: '100%',
            textAlign: 'center',
            backgroundColor: '#faebe0',
                            boxShadow: '0 0px 5px #d772204d',

          }}
        >
          <span style={{ fontFamily: 'Inter', fontSize: '26px', fontWeight: 800, color: '#D1915F' }}>
            Good Day
          </span>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {error && (
            <div style={{
              backgroundColor: '#fff1f0',
              border: '2px solid #f2d8c3',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#D1915F' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or employee"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.6)',
                padding: '14px 18px',
                borderRadius: '14px',
                fontSize: '16px',
                color: '#5a483e',
                border: `2px solid #f2d8c3`,
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 0px 5px #d772204d',

              }}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: 'Inter', fontSize: '20px', fontWeight: 700, color: '#D1915F' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.6)',
                padding: '14px 18px',
                borderRadius: '14px',
                fontSize: '16px',
                color: '#5a483e',
                border: `2px solid #f2d8c3`,
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 0px 5px #d772204d',
 
              }}
            />
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: '#D1915F',
              color: '#ffffff',
              padding: '20px',
              borderRadius: '50px',
              fontSize: '19px',
              fontWeight: 700,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '8px',
              transition: 'background-color 0.2s, transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 1px 14px #996133cd',
              transform: 'translateY(0)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#D1915F';
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 18px #996133cd';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#D1915F';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 14px #996133cd';
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 1px 8px #996133cd';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 6px 18px #996133cd';
            }}
          >
            {isSubmitting ? 'Verifying...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}