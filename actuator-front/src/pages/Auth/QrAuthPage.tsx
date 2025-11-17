import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Auth from './Auth';
import type { CredentialResponse } from '../../types/google-oauth';
import { API_BASE_URL } from '../../lib/utils';

const QrAuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      console.log('🔐 Google login successful:', credentialResponse);

      // 토큰을 백엔드로 전송하여 인증 처리
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Authentication successful:', data);

      // 세션 정보 저장 및 홈으로 이동
      if (data.user) {
        localStorage.setItem('userSession', JSON.stringify(data.user));
      }
      
      // 성공 후 홈으로 네비게이트
      navigate('/');
    } catch (error) {
      console.error('❌ Google authentication error:', error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <Auth
      handleBack={handleBack}
      handleGoogleSuccess={handleGoogleSuccess}
    />
  );
};

export default QrAuthPage;
