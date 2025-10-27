import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ParticipantCounterProvider } from './context/ParticipantCounterContext';
import BuildYourPerfectActuator from './components/BuildYourPerfectActuator';
import Analytics from './components/Analytics';
import ParticipantCountDisplay from './components/ParticipantCountDisplay';

function App() {
    return (
        <ParticipantCounterProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<BuildYourPerfectActuator />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/count" element={<ParticipantCountDisplay />} />
                </Routes>
            </Router>
        </ParticipantCounterProvider>
    );
}

export default App;