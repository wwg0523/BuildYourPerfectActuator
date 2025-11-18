// src/pages/Auth/QrGoogleCallbackPage.tsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QrGoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // URL 예시: https://example.com/qr/google-callback#id_token=...&state=qr
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.substring(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');

    if (!idToken) {
      console.error('❌ No id_token in callback URL');
      navigate('/'); // 실패 시 홈으로
      return;
    }

    // QR 경로 플래그 + 토큰 저장
    localStorage.setItem('qrAccess', 'true');
    localStorage.setItem('qrIdToken', idToken);

    console.log('✅ QR redirect: got id_token, stored in localStorage.');

    // 실제 처리는 ActuatorMinigame에서 하도록 홈으로 보냄
    navigate('/');
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666',
      }}
    >
      <p>Finalizing Google login...</p>
    </div>
  );
};

export default QrGoogleCallbackPage;
