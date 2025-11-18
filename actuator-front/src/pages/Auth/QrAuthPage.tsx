import React, { useEffect } from 'react';

const QrAuthPage: React.FC = () => {

  useEffect(() => {
    // QR 접근 플래그 저장
    localStorage.setItem('qrAccess', 'true');
    console.log('🔍 QR access detected, redirecting to home...');
    
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID!;
    const redirectUri = `${window.location.origin}/qr/google-callback`;

    // 필요한 권한: 오직 사용자 식별용이면 이 정도면 충분
    const scope = [
      'openid',
      'email',
      'profile',
    ].join(' ');

    // implicit flow-like: id_token 을 바로 받는 패턴
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'id_token', // or 'token id_token' 등
      scope,
      nonce: Math.random().toString(36).slice(2), // 실제로는 백엔드에서 검증하는 게 정석
      state: 'qr', // 나중에 필요하면 구분용
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.log('🔍 QR access detected, redirecting to Google Auth...', googleAuthUrl);
    window.location.href = googleAuthUrl;
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '18px',
      color: '#666',
    }}>
      <p>Redirecting to Google...</p>
    </div>
  );
};

export default QrAuthPage;