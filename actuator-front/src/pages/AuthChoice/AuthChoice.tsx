import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '../../types/google-oauth';
import './AuthChoice.scss';

interface AuthChoiceProps {
    handleBack: () => void;
    handleGoogleSuccess: (credentialResponse: CredentialResponse) => void;
}

const AuthChoice: React.FC<AuthChoiceProps> = ({
    handleBack,
    handleGoogleSuccess,
}) => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const isGoogleConfigured = googleClientId && googleClientId !== 'invalid-client-id';

    useEffect(() => {
        // Google SDK 초기화 확인
        if (!window.google) {
            console.error('Google SDK is not loaded');
        }
        if (!isGoogleConfigured) {
            console.warn(
                'Google OAuth Client ID is not configured. ' +
                'Please set REACT_APP_GOOGLE_CLIENT_ID in your environment variables.'
            );
        }
    }, [isGoogleConfigured]);

    return (
        <div className="auth-choice-container">
            <div className="auth-options">
                <div className="option google-login-option">
                    <h3>Login with Google</h3>
                    <p className="option-description">Sign in with your Google account</p>
                    <div className="google-button-wrapper">
                        {!isGoogleConfigured ? (
                            <div className="config-error">
                                <p style={{ color: 'red', textAlign: 'center' }}>
                                    ⚠️ Google OAuth is not configured. Please contact the administrator.
                                </p>
                            </div>
                        ) : (
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => console.log('Login Failed')}
                                width="250"
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="auth-choice-footer">
                <button className="button outline" onClick={handleBack}>
                    BACK
                </button>
            </div>
        </div>
    );
};

export default AuthChoice;
