import React, { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '../../types/google-oauth';
import './AuthChoice.scss';

interface AuthChoiceProps {
    handleBack: () => void;
    handleGoogleSuccess: (credentialResponse: CredentialResponse) => void;
    handleSignUp: () => void;
}

const AuthChoice: React.FC<AuthChoiceProps> = ({
    handleBack,
    handleGoogleSuccess,
    handleSignUp,
}) => {
    useEffect(() => {
        // Google SDK 초기화 확인
        if (!window.google) {
            console.error('Google SDK is not loaded');
        }
    }, []);

    return (
        <div className="auth-choice-container">
            <h2>Welcome</h2>
            <p className="subtitle">Choose how you want to proceed</p>

            <div className="auth-options">
                <div className="option google-login-option">
                    <h3>Login with Google</h3>
                    <p className="option-description">Sign in with your Google account</p>
                    <div className="google-button-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => console.log('Login Failed')}
                            width="250"
                        />
                    </div>
                </div>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="option signup-option">
                    <h3>Sign Up</h3>
                    <p className="option-description">Create a new account manually</p>
                    <button className="button signup-btn" onClick={handleSignUp}>
                        SIGN UP
                    </button>
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
