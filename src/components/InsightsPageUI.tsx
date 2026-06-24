import React from 'react';
import { useNavigate } from 'react-router-dom';

import cafeLogo       from '../assets/cafeLogo.png';
import homeIcon       from '../assets/homeIcon.png';
import posIcon        from '../assets/posIcon.png';
import inventoryIcon  from '../assets/inventoryIcon.png';
import insightsIcon   from '../assets/insightsIcon.png';
import adminIcon      from '../assets/adminIcon.png';

interface InsightsPageUIProps {
  userRole: string | undefined;
  currentTab: string;
  onTabChange: (tab: string) => void;
  // Slots left completely open for your groupmates to customize
  leftCardsSlot?: React.ReactNode; 
  mainContentSlot?: React.ReactNode; 
}

export default function InsightsPageUI({
  userRole,
  currentTab,
  onTabChange,
  leftCardsSlot,
  mainContentSlot,
}: InsightsPageUIProps) {
  const navigate = useNavigate();
  

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: "'Inter', sans-serif",
      padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box'
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap');`}</style>

      {/* HEADER PANEL */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src={cafeLogo} style={{ height: 70, width: 'auto', objectFit: 'contain' }} alt="Logo" />
          <h1 style={{ fontFamily: "'Liu Jian Mao Cao', cursive", fontSize: 33, color: '#1E1E1E', lineHeight: 0.85, margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            <span>Tita's</span><span>cafe</span>
          </h1>
        </div>

        {/* CAPSULE NAVIGATION TABS FROM image_888228.png */}
        <div style={{ display: 'flex', gap: 16, background: '#FFFFFF', padding: '6px', borderRadius: 30, border: '2px solid #f2d8c3', width: '500px', justifyContent: 'space-between' }}>
          {['REPORTS & ANALYTICS', 'FORECAST'].map((tab) => {
            const isActive = currentTab === tab;
            return (
              <button 
                key={tab} 
                onClick={() => onTabChange(tab)} 
                style={{ 
                  flex: 1,
                  padding: '12px 24px', 
                  borderRadius: 24, 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontWeight: 700, 
                  fontSize: 13, 
                  letterSpacing: 0.5, 
                  transition: 'all 0.2s', 
                  backgroundColor: isActive ? '#faebe0' : 'transparent', 
                  color: isActive ? '#D1915F' : '#D1915F',
                  boxShadow: isActive ? '0px 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* USER PROFILE STATUS CHIP */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#faebe0', padding: '10px 20px', borderRadius: 28, border: '2px solid #f2d8c3', color: '#D1915F', fontWeight: 'bold', fontSize: 16 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden' }}>
            <img src={adminIcon} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span>{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : 'Staff'}</span>
        </div>
      </header>

      {/* TWO COLUMN GRID FROM image_888228.png (Left: Cards, Right: Main Screen Area) */}
      <main style={{ 
        display: 'grid', 
        gridTemplateColumns: '260px 1fr', 
        gap: 24, 
        flexGrow: 1, 
        alignItems: 'stretch', 
        marginBottom: 24,
        minHeight: 'calc(102.5vh - 270px)', 
        maxHeight: 'calc(102.5vh - 270px)'  
      }}>        
        
        {/* LEFT COLUMN: Summary Metrics Stack */}
        <aside style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 16,
          justifyContent: 'flex-start'
        }}>          
          {leftCardsSlot}
        </aside>

        {/* RIGHT COLUMN: Interactive Feature Sheet workspace */}
        <section style={{ 
          border: '2px solid #f2d8c3', 
          borderRadius: 16, 
          background: '#FFFFFF', 
          padding: 24, 
          display: 'flex', 
          flexDirection: 'column', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          boxSizing: 'border-box',
          overflowY: 'auto' 
        }}>          
          {mainContentSlot}
        </section>
      </main>

      {/* FOOTER BAR */}
      <nav style={{ background: '#ffffff', borderRadius: 35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 6, width: '100%', boxSizing: 'border-box', border: '2px solid #f2d8c3', marginTop: 16 }}>
        {[
          { label: 'HOME',         icon: homeIcon,      path: '/home',      active: false },
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