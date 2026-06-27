import { type LucideIcon } from 'lucide-react';

interface HomeHubUIProps {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
}

export default function HomeHubUI({ title, icon: Icon, onClick }: HomeHubUIProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 260px',
        minWidth: '260px',
        backgroundColor: '#ffffff',
        border: '2px solid #f2d8c3',
        borderRadius: '22px',
        padding: '44px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '22px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
        boxShadow: '0 0px 5px #d772204d',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(194,150,118,0.18)';
        e.currentTarget.style.borderColor = '#f2d8c3';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
        e.currentTarget.style.borderColor = '#f2d8c3';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        style={{
          width: '92px',
          height: '92px',
          borderRadius: '20px',
          backgroundColor: '#faebe0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          border: '2px solid #f2d8c3',
          boxShadow: '0 0px 5px #d772204d',
        }}
      >
        <Icon size={44} color="#D1915F" strokeWidth={2} />
      </div>
      <span
        style={{
          fontSize: '17px',
          fontWeight: 800,
          letterSpacing: '0.03em',
          color: '#D1915F',
        }}
      >
        {title}
      </span>
    </button>
  );
}