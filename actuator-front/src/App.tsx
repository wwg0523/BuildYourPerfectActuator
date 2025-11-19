import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ParticipantCounterProvider } from './context/ParticipantCounterContext';
import ActuatorMinigame from './components/ActuatorMinigame';
import QrAuthPage from './pages/Auth/QrAuthPage';
import QrGoogleCallbackPage from './pages/Auth/QrGoogleCallbackPage';
import Analytics from './components/Analytics';
import ParticipantCountDisplay from './components/ParticipantCountDisplay';

function App() {
    const basePath = '/minigame';
    return (
        <ParticipantCounterProvider>
            <Router basename={basePath}>
                <Routes>
                    <Route path="/" element={<ActuatorMinigame />} />
                    <Route path="/qr/auth" element={<QrAuthPage />} />
                    <Route path="/qr/google-callback" element={<QrGoogleCallbackPage />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/count" element={<ParticipantCountDisplay />} />
                </Routes>
            </Router>
        </ParticipantCounterProvider>
    );
}

export default App;