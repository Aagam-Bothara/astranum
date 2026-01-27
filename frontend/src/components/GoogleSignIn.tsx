'use client';

import { useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  buttonText?: 'signin_with' | 'signup_with' | 'continue_with';
}

export default function GoogleSignIn({ onSuccess, onError, buttonText = 'signin_with' }: GoogleSignInProps) {
  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      await api.googleAuth(response.credential);
      onSuccess();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        onError(detail);
      } else {
        onError('Failed to sign in with Google');
      }
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.warn('Google Client ID not configured');
      return;
    }

    // Load the Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });

        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: buttonText,
            width: 350,
            logo_alignment: 'left',
          });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [handleCredentialResponse, buttonText]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return null; // Don't render if not configured
  }

  return (
    <div className="w-full">
      <div id="google-signin-button" className="flex justify-center"></div>
    </div>
  );
}
