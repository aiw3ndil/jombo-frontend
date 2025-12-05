"use client";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { loginWithGoogle } from '@/app/lib/api/auth';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  redirect?: string | null;
}

export default function GoogleLoginButton({ onSuccess, onError, redirect }: GoogleLoginButtonProps) {
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { t } = useTranslation("login");
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log('🔵 [GoogleLogin] Credential received from Google', {
      hasCredential: !!credentialResponse.credential,
      clientId: credentialResponse.clientId
    });

    if (!credentialResponse.credential) {
      console.error('❌ [GoogleLogin] No credential in response');
      const errorMessage = 'No se recibió credencial de Google';
      if (onError) {
        onError(errorMessage);
      }
      return;
    }

    try {
      setIsLoading(true);
      
      // Send ID token to backend
      console.log('🔵 [GoogleLogin] Sending credential to backend...');
      const { user } = await loginWithGoogle(credentialResponse.credential);
      console.log('🔵 [GoogleLogin] Backend login successful:', user);
      
      if (onSuccess) {
        onSuccess(user);
      }
      
      const destination = redirect || `/${lang}`;
      console.log('🔵 [GoogleLogin] Redirecting to:', destination);
      window.location.href = destination;
    } catch (error: any) {
      console.error('❌ [GoogleLogin] Error during login:', error);
      console.error('❌ [GoogleLogin] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        status: error.status
      });
      
      const errorMessage = error.message || 'Error al iniciar sesión con Google';
      
      if (onError) {
        onError(errorMessage);
      }
      
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.error('❌ [GoogleLogin] OAuth error');
    const errorMessage = 'Error al iniciar sesión con Google';
    
    if (onError) {
      onError(errorMessage);
    }
  };

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center py-2.5">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
        </div>
      )}
      <div className={isLoading ? 'hidden' : ''}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          type="standard"
          size="large"
          text="continue_with"
          width="100%"
          theme="outline"
          logo_alignment="left"
        />
      </div>
    </div>
  );
}
