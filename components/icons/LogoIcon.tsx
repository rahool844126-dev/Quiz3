
import React from 'react';
export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22 12L18 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 12L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
