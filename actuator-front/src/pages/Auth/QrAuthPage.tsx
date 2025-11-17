import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QrAuthPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // QR 접근 플래그 저장
    localStorage.setItem('qrAccess', 'true');
    console.log('🔍 QR access detected, redirecting to home...');
    
    // Home으로 리다이렉트
    navigate('/');
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '18px',
      color: '#666',
    }}>
      <p>Redirecting...</p>
    </div>
  );
};

export default QrAuthPage;



