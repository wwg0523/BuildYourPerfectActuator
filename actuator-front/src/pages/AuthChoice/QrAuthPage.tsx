// src/pages/QrAuthPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthChoice from './AuthChoice';
import type { CredentialResponse } from '../../types/google-oauth';

const QrAuthPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => void 0;

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => void 0;

  return (
    <AuthChoice
      handleBack={handleBack}
      handleGoogleSuccess={handleGoogleSuccess}
    />
  );
};

export default QrAuthPage;
