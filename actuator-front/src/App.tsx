import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ParticipantCounterProvider } from './context/ParticipantCounterContext';
import ActuatorMinigame from './components/ActuatorMinigame';
import QrAuthPage from './pages/Auth/QrAuthPage';
import Analytics from './components/Analytics';
import ParticipantCountDisplay from './components/ParticipantCountDisplay';

function App() {
    return (
        <ParticipantCounterProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<ActuatorMinigame />} />
                    <Route path="/qr/auth" element={<QrAuthPage />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/count" element={<ParticipantCountDisplay />} />
                </Routes>
            </Router>
        </ParticipantCounterProvider>
    );
}

export default App;