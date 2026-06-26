import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import cafeLogo from '../assets/cafeLogo.png';
import homeIcon from '../assets/homeIcon.png';
import posIcon from '../assets/posIcon.png';
import inventoryIcon from '../assets/inventoryIcon.png';
import insightsIcon from '../assets/insightsIcon.png';
import adminIcon from '../assets/adminIcon.png';

interface InsightsPageUIProps {
  userRole?: string;
  currentTab: string;
  onTabChange: (tab: string) => void;
  leftCardsSlot: ReactNode;
  mainContentSlot: ReactNode;
}

export default function InsightsPageUI({ userRole, currentTab, onTabChange, leftCardsSlot, mainContentSlot }: InsightsPageUIProps) {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif", padding: 24, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');`}</style>

      {/* HEADER ROW */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={cafeLogo} style={{ height: 70, width: 'auto', objectFit: 'contain' }} alt="Logo" />
          <h1 style={{ fontFamily: "'Liu Jian Mao Cao', cursive", fontSize: 33, color: '#1E1E1E', lineHeight: 0.85, margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            <span>Tita's</span><span>cafe</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 16, background: '#FFFFFF', padding: '6px', borderRadius: 30, border: '2px solid #f2d8c3' }}>
          {['REPORTS & ANALYTICS', 'FORECAST'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => onTabChange(tab)} 
              style={{ padding: '10px 20px', borderRadius: 24, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, letterSpacing: 0.5, transition: 'all 0.2s', backgroundColor: currentTab === tab ? '#faebe0' : 'transparent', color: currentTab === tab ? '#D1915F' : '#D1915F' }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#faebe0', padding: '10px 20px', borderRadius: 28, border: '2px solid #f2d8c3', color: '#D1915F', fontWeight: 'bold', fontSize: 16 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={adminIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : 'Guest'}</span>
        </div>
      </header>

      {/* MAIN WORKSPACE GRID */}
      <main style={{ display: 'flex', gap: 24, flexGrow: 1, marginBottom: 24, alignItems: 'stretch', minHeight: 0, overflow: 'hidden' }}>
        
        {/* LEFT CARDS SLOT - Updated to stretch full height */}
        <aside style={{ display: 'flex', flexDirection: 'column', minWidth: 240, width: 240 }}>
          {leftCardsSlot}
        </aside>

        {/* MAIN CONTENT SLOT */}
        <section style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 12, border: '2px solid #f2d8c3', padding: 24, overflow: 'hidden' }}>
          {mainContentSlot}
        </section>

      </main>

      {/* FOOTER NAV */}
      {/* BOTTOM NAV BAR */}
      <nav style={{ background: '#ffffff', borderRadius: 35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 6, width: '100%', boxSizing: 'border-box', border: '2px solid #f2d8c3', flexShrink: 0 }}>
        {[
          { label: 'HOME',           icon: homeIcon,      path: '/home',      active: false },
          { label: 'POINT OF SALES', icon: posIcon,       path: '/pos',       active: false },
          { label: 'INVENTORY',      icon: inventoryIcon, path: '/inventory', active: false },
          { label: 'INSIGHTS',       icon: insightsIcon,  path: '/insights',  active: true },
        ].map(({ label, icon, path, active }) => (
          <button key={label} type="button" onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, margin: '0 4px', padding: '14px 22px', borderRadius: 28, cursor: 'pointer', color: '#D1915F', fontWeight: 700, fontSize: 14, transition: 'all 0.2s ease-in-out', border: active ? '2px solid #f2d8c3' : '2px solid transparent', background: active ? '#FFFFFF' : 'transparent', boxShadow: active ? '0 1px 4px #f2d8c3' : 'none' }}>
            <img src={icon} alt="" style={{ height: 22, width: 22, objectFit: 'contain', flexShrink: 0 }} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}