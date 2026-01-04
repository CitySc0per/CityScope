import React from 'react';

export function Button({ onClick, children }) { 
  return <button onClick={onClick} style={{ backgroundColor: '#3B82F6', color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '16px' }}>{children}</button>; 
}