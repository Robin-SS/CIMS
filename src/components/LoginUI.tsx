import React from 'react';
import { AlertCircle } from 'lucide-react';
import cafeLogo from '../assets/cafeLogo.png';
import loginBG from '../assets/loginBG.png';

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
      {/* White Card Layout */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '32px',
          padding: '50px 60px',
          width: '100%',
          maxWidth: '840px', 
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr', 
          alignItems: 'center',
          gap: '40px',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0px 8px 24px #00000026',
        }}
      >
        {/* Left Column: Branding Container */}
        <div
          style={{
            backgroundColor: '#faebe0',
            border: '2px solid #f2d8c3',
            borderRadius: '24px',
            padding: '54px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px', 
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Coffee Image */}
          <img
            src={cafeLogo}
            alt="Tita's Cafe Logo"
            style={{
              width: '160px',
              height: '160px',
              objectFit: 'contain',
              filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.15))',
              position: 'relative',
              zIndex: 1,
            }}
          />

          {/* Typography */}
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');`}</style>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              lineHeight: '0.85', 
              color: '#333333',
              fontFamily: '"Liu Jian Mao Cao", cursive',
              fontSize: '74px',
              margin: 0,
              marginLeft: '-1px', 
              padding: 0,
              position: 'relative',
              zIndex: 2,
              WebkitTextStroke: '1.5px #333333', // Makes the brush strokes thicker
            }}
          >
            <span>Tita's</span>
            <span style={{ paddingLeft: '10px' }}>cafe</span>
          </div>
        </div>

        {/* Right Column: Form Fields & Header Elements */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* "Good Day!" pill badge */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                width: '100%', 
                marginBottom: '2px',
                boxSizing: 'border-box'
              }}
            >
              <span style={{
                border: '2px solid #f2d8c3',
                color: '#D1915F',
                borderRadius: '20px',
                padding: '4px 152px',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                alignItems: 'center',
              }}>
                GOOD DAY!
              </span>
            </div>

          <form onSubmit={onSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {error && (
              <div style={{
                backgroundColor: '#fff1f0',
                border: '1px solid #fca5a5',
                borderRadius: '14px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#dc2626',
                fontSize: '14px',
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Role Input Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#D1915F' }}>Role</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin or staff"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: '#faebe0',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  color: '#8A7E72',
                  border: '2px solid #f2d8c3',                  
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Password Input Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, color: '#D1915F' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  backgroundColor: '#faebe0',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  color: '#8A7E72',
                  border: '2px solid #f2d8c3',                
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
                backgroundColor: '#D1915F',
                color: '#ffffff',
                padding: '14px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: '700',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                marginTop: '12px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#b87b4c')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#D1915F')}
            >
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}