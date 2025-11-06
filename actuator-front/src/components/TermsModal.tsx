import React from 'react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({
    isOpen,
    onClose,
    onAccept,
}) => {
    if (!isOpen) return null;

    const handleAccept = () => {
        onAccept();
    };

    return (
        <div className="modal-overlay terms-modal-overlay" onClick={onClose}>
            <div className="modal terms-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Terms and Conditions</h2>
                <div className="terms-content">
                    <h3>1. Data Collection and Privacy</h3>
                    <p>
                        By participating in this interactive game, you consent to the collection and processing
                        of your personal information including name, company, email, and phone number for the
                        following purposes:
                    </p>
                    <ul>
                        <li>Marketing communications regarding our actuator products and services</li>
                        <li>Technical support and customer service</li>
                        <li>Industry research and product development insights</li>
                        <li>Event follow-up and future exhibition notifications</li>
                    </ul>

                    <h3>2. Data Protection Rights</h3>
                    <p>Under GDPR and applicable data protection laws, you have the right to:</p>
                    <ul>
                        <li>Access your personal data</li>
                        <li>Rectify inaccurate personal data</li>
                        <li>Erase your personal data ("right to be forgotten")</li>
                        <li>Restrict processing of your personal data</li>
                        <li>Data portability</li>
                        <li>Object to processing</li>
                    </ul>

                    <h3>3. Data Retention</h3>
                    <p>
                        Your personal information will be retained for a maximum period of 24 months from
                        the date of collection, unless you request earlier deletion or longer retention
                        is required by law.
                    </p>

                    <h3>4. Contact Information</h3>
                    <p>
                        For any questions regarding your personal data or to exercise your rights,
                        please contact our Data Protection Officer at: privacy@lebot.co.kr
                    </p>

                    <p>I have read and agree to the Terms and Conditions</p>
                    <p>I consent to receive marketing communications</p>
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="button outline">DECLINE</button>
                    <button onClick={handleAccept} className="button">ACCEPT</button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;