import React from 'react';

interface LifelineButtonProps {
  type: 'fiftyFifty' | 'phoneFriend' | 'askAudience';
  used: boolean;
  onClick: () => void;
  isActivating?: boolean;
}

const ICONS: Record<LifelineButtonProps['type'], React.ReactNode> = {
  fiftyFifty: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414m12.728 0l-1.414 1.414M5.636 18.364l-1.414 1.414" />
      <path d="M12 18a6 6 0 000-12V4a8 8 0 010 16v-2z" strokeWidth={1} fill="currentColor" />
    </svg>
  ),
  phoneFriend: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  askAudience: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

const LifelineButton: React.FC<LifelineButtonProps> = ({ type, used, onClick, isActivating }) => {
  const activatingClass = isActivating ? 'animate-lifeline-success' : '';

  return (
    <button
      onClick={onClick}
      disabled={used || isActivating}
      className={`relative w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
        used
          ? 'bg-red-500/50 border-red-400 cursor-not-allowed'
          : 'bg-slate-700 border-slate-500 hover:bg-slate-600'
      } ${activatingClass}`}
    >
      {ICONS[type]}
      {used && (
       <svg xmlns="http://www.w3.org/2000/svg" className="absolute h-10 w-10 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
       </svg>
      )}
    </button>
  );
};

export default LifelineButton;
