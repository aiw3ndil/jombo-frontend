"use client";
import { useGoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '@/app/lib/api/auth';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  redirect?: string | null;
}

export default function GoogleLoginButton({ onSuccess, onError, redirect }: GoogleLoginButtonProps) {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const { t } = useTranslation("login");
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('🔵 [GoogleLogin] Token received from Google', {
        hasAccessToken: !!tokenResponse.access_token,
        tokenType: tokenResponse.token_type,
        expiresIn: tokenResponse.expires_in
      });

      try {
        setIsLoading(true);
        
        // Get user info using access token
        console.log('🔵 [GoogleLogin] Fetching user info from Google...');
        const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`);
        
        if (!userInfoResponse.ok) {
          throw new Error(`Failed to get user info: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
        }
        
        const userInfo = await userInfoResponse.json();
        console.log('🔵 [GoogleLogin] User info received:', {
          email: userInfo.email,
          name: userInfo.name,
          sub: userInfo.sub
        });
        
        // Send access token to backend
        console.log('🔵 [GoogleLogin] Sending token to backend...');
        const { user } = await loginWithGoogle(tokenResponse.access_token);
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
          name: error.name
        });
        
        const errorMessage = error.message || 'Error al iniciar sesión con Google';
        
        if (onError) {
          onError(errorMessage);
        } else {
          // Show alert in production if no error handler
          alert(`Error de autenticación: ${errorMessage}`);
        }
        
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('❌ [GoogleLogin] OAuth popup error:', error);
      const errorMessage = 'Error al iniciar sesión con Google';
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(`Error de autenticación: ${errorMessage}`);
      }
    },
  });

  return (
    <button
      onClick={() => {
        console.log('🔵 [GoogleLogin] Button clicked, opening OAuth popup...');
        login();
      }}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{t("continueWith").replace("{provider}", "Google")}</span>
        </>
      )}
    </button>
  );
}
