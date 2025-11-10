import React from 'react';
import TermsModal from '../../components/TermsModal';
import { UserInfo } from '../../lib/utils';
import './Info.scss';

interface InfoProps {
    userInfo: UserInfo;
    errors: { [key: string]: string };
    termsAccepted: boolean;
    showModal: boolean;
    agreeTerms: boolean;
    agreeMarketing: boolean;
    handleInputChange: (field: keyof UserInfo, value: string) => void;
    handleCheckboxClick: (e: React.MouseEvent<HTMLInputElement>) => void;
    setShowModal: (show: boolean) => void;
    setAgreeTerms: (agree: boolean) => void;
    setAgreeMarketing: (agree: boolean) => void;
    setTermsAccepted: (accepted: boolean) => void;
    handleBack: () => void;
    handleContinue: () => void;
}

const Info: React.FC<InfoProps> = ({
    userInfo,
    errors,
    termsAccepted,
    showModal,
    handleInputChange,
    handleCheckboxClick,
    setShowModal,
    setTermsAccepted,
    handleBack,
    handleContinue,
}) => {
    return (
        <>
            <h2>Enter Your Information</h2>
            <input
                type="text"
                placeholder="Name"
                value={userInfo.name}
                onChange={e => handleInputChange('name', e.target.value)}
            />
            <p className="error">{errors.name || '\u00A0'}</p>

            <input
                type="text"
                placeholder="Company"
                value={userInfo.company}
                onChange={e => handleInputChange('company', e.target.value)}
            />
            <p className="error">{errors.company || '\u00A0'}</p>

            <input
                type="email"
                placeholder="Email"
                value={userInfo.email}
                onChange={e => handleInputChange('email', e.target.value)}
            />
            <p className="error">{errors.email || '\u00A0'}</p>

            <input
                type="tel"
                placeholder="Phone (+CountryCodeNumber)"
                value={userInfo.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
            />
            <p className="error">{errors.phone || '\u00A0'}</p>

            <div className="terms-container">
                <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onClick={handleCheckboxClick}
                    readOnly
                />
                <label htmlFor="terms">I agree to the Terms and Conditions</label>
            </div>

            <TermsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onAccept={() => {
                    setTermsAccepted(true);
                    setShowModal(false);
                }}
            />

            <div>
                <button className="button outline" onClick={handleBack}>BACK</button>
                <button className="button" onClick={handleContinue}>CONTINUE</button>
            </div>
        </>
    );
};

export default Info;