import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Monitor, Package, BarChart3, LogOut } from 'lucide-react';
import cafeLogo from '../assets/cafeLogo.png';
import adminIcon from '../assets/adminIcon.png';

export default function HomeHub() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const modules = [
    {
      title: 'POINT OF SALES',
      path: '/pos',
      icon: Monitor,
    },
    {
      title: 'INVENTORY',
      path: '/inventory',
      icon: Package,
    },
    {
      title: 'INSIGHTS',
      path: '/insights',
      icon: BarChart3,
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');`}</style>

      {/* Top Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 40px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={cafeLogo} style={{ height: 70, width: 'auto', objectFit: 'contain' }} alt="Logo" />
          <h1
            style={{
              fontFamily: "'Liu Jian Mao Cao', cursive",
              fontSize: 33,
              color: '#1E1E1E',
              lineHeight: 0.85,
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Tita's</span>
            <span>cafe</span>
          </h1>
        </div>

        {/* Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#faebe0',
            padding: '10px 20px',
            borderRadius: 28,
            border: '2px solid #f2d8c3',
            color: '#D1915F',
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={adminIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Guest'}</span>
        </div>
      </header>

      {/* Main Panel */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 40px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1040px',
            backgroundColor: '#ffffff',
            border: '1px solid #ede1d3',
            borderRadius: '28px',
            padding: '36px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
            display: 'flex',
            gap: '28px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.path}
                onClick={() => navigate(mod.path)}
                style={{
                  flex: '1 1 260px',
                  minWidth: '260px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #c9a47f',
                  borderRadius: '22px',
                  padding: '44px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '22px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(194,150,118,0.18)';
                  e.currentTarget.style.borderColor = '#c29676';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#c9a47f';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '20px',
                    backgroundColor: '#f5e9da',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={44} color="#c29676" strokeWidth={2} />
                </div>
                <span
                  style={{
                    fontSize: '17px',
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                    color: '#1a1a1a',
                  }}
                >
                  {mod.title}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Sign Out */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '0 40px 40px',
        }}
      >
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#e74c3c',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '15px',
            letterSpacing: '0.05em',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 28px',
            cursor: 'pointer',
            boxShadow: '0 6px 16px rgba(231,76,60,0.3)',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d63d2c')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e74c3c')}
        >
          <LogOut size={18} />
          SIGN OUT
        </button>
      </div>
    </div>
  );
}