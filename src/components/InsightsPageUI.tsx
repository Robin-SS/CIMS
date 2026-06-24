import React, { type ReactNode } from 'react';
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
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif", padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      
      {/* HEADER ROW */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={cafeLogo} style={{ height: 70, width: 'auto', objectFit: 'contain' }} alt="Logo" />
          <h1 style={{ fontFamily: "'Liu Jian Mao Cao', cursive", fontSize: 33, color: '#1E1E1E', lineHeight: 0.85, margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            <span>Tita's</span><span>cafe</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 16, background: '#F1F1F1', padding: '6px', borderRadius: 30, border: '1px solid #D3C9BE' }}>
          {['REPORTS & ANALYTICS', 'FORECAST'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => onTabChange(tab)} 
              style={{ padding: '10px 40px', borderRadius: 24, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13, transition: 'all 0.2s', backgroundColor: currentTab === tab ? '#FFFFFF' : 'transparent', color: currentTab === tab ? '#1E1E1E' : '#8A7E72', boxShadow: currentTab === tab ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', padding: '10px 20px', borderRadius: 28, border: '1px solid #D3C9BE', color: '#D1915F', fontWeight: 'bold', fontSize: 16 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={adminIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : 'Guest'}</span>
        </div>
      </header>

      {/* MAIN WORKSPACE GRID */}
      <main style={{ display: 'flex', gap: 24, flexGrow: 1, marginBottom: 24 }}>
        
        {/* LEFT CARDS SLOT - Receives the AnalyticsKpiCards */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 240 }}>
          {leftCardsSlot}
        </aside>

        {/* MAIN CONTENT SLOT - Receives the Restock List / Forecast */}
        <section style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', borderRadius: 12, border: '1px solid #D3C9BE', padding: 24, boxShadow: '0 4px 40px rgba(0,0,0,0.02)' }}>
          {mainContentSlot}
        </section>

      </main>

      {/* FOOTER NAV */}
      <nav style={{ background: '#F1F1F1', borderRadius: 35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 6, width: '100%', boxSizing: 'border-box', border: '1px solid #D3C9BE' }}>
        {[
          { label: 'HOME',           icon: homeIcon,      path: '/home',      active: false },
          { label: 'POINT OF SALES', icon: posIcon,       path: '/pos',       active: false },
          { label: 'INVENTORY',      icon: inventoryIcon, path: '/inventory', active: false },
          { label: 'INSIGHTS',       icon: insightsIcon,  path: '/insights',  active: true  },
        ].map(({ label, icon, path, active }) => (
          <button key={label} type="button" onClick={() => navigate(path)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flex: 1, margin: '0 4px', padding: '14px 22px', borderRadius: 28, cursor: 'pointer', color: '#D1915F', fontWeight: 700, fontSize: 14, transition: 'all 0.2s ease-in-out', border: active ? '1px solid #D3C9BE' : '1px solid transparent', background: active ? '#FFFFFF' : 'transparent', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.05)' : 'none' }}>
            <img src={icon} alt="" style={{ height: 22, width: 22, objectFit: 'contain', flexShrink: 0 }} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}