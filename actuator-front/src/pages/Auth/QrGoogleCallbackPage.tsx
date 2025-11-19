import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const QrGoogleCallbackPage: React.FC = () => {
	const navigate = useNavigate();

	useEffect(() => {
		if (window.location.pathname !== '/minigame/qr/google-callback' && window.location.pathname !== '/qr/google-callback') {
			return;
		}
		// URL 예시: https://example.com/minigame/qr/google-callback#id_token=...&state=qr
		const hash = window.location.hash.startsWith('#')
			? window.location.hash.substring(1)
			: window.location.hash;

		console.log('📍 callback href:', window.location.href);
		console.log('📍 callback search:', window.location.search);
		console.log('📍 callback hash:', window.location.hash);

		const params = new URLSearchParams(hash);
		const idToken = params.get('id_token');

		console.log('🔑 extracted id_token:', idToken);

		if (!idToken) {
			console.error('❌ No id_token in callback URL');

			const debugParams = new URLSearchParams(
				window.location.hash.substring(1) || window.location.search.substring(1)
			);
			console.log('🔎 debug params:', Object.fromEntries(debugParams.entries()));
			navigate('/');
			return;
		}

		// QR 경로 플래그 + 토큰 저장
		localStorage.setItem('qrAccess', 'true');
		localStorage.setItem('qrIdToken', idToken);

		console.log('✅ QR redirect: got id_token, stored in localStorage.');

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
