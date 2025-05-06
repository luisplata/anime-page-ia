'use client';

import { useEffect } from 'react';
import type React from 'react';

const CLIENT_UUID_KEY = 'client-uuid';

function generateBrowserUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const ClientUuidProvider: React.FC = () => {
  useEffect(() => {
    let uuid = localStorage.getItem(CLIENT_UUID_KEY);
    if (!uuid) {
      uuid = generateBrowserUUID();
      localStorage.setItem(CLIENT_UUID_KEY, uuid);
    }
    
    // Set as a cookie to be available for server components
    // Expires in 1 year, adjust as needed
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${CLIENT_UUID_KEY}=${uuid}; path=/; expires=${expires}; SameSite=Lax`;
  }, []);

  return null; // This component does not render anything
};

export default ClientUuidProvider;
